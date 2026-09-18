import { fmt } from '../../utils';

// Algoritmo de conciliación factura↔movimiento — extraído literal de detectarErrores() (Fase 16).
// Recibe las 3 listas ya cargadas (facturasGuardadas, movs, ctodosMatch) y devuelve conflictos.
export function detectarConflictosFiscales({ facturasGuardadas, movs, ctodosMatch }) {
      const conflictos = [];
      const movsUsados = new Set();
      const normTipo = t => (t || '').toLowerCase().includes('ingreso') ? 'ingreso' : 'gasto';
      const mesNom = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

      // Tokeniza un texto: minúsculas, sin acentos, sin puntuación, palabras de ≥3 chars
      const tokens = s => (s || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/).filter(w => w.length >= 3);

      // Nombres canónicos de una factura: siempre del contacto vinculado (nombre + alias).
      // Si no hay contacto vinculado, devuelve [] — se trata como error de datos.
      const facNombres = fac => {
        const contactoId = fac.tipo === 'gasto' ? fac.factura_proveedor_id : fac.factura_cliente_id;
        const contacto = contactoId ? ctodosMatch.find(c => c.id === contactoId) : null;
        if (!contacto) return [];
        const nombres = [];
        if (contacto.nombre) nombres.push(contacto.nombre);
        if (contacto.nombre_empresa) nombres.push(contacto.nombre_empresa);
        if (Array.isArray(contacto.alias)) nombres.push(...contacto.alias.filter(Boolean));
        return nombres;
      };

      // Penalización: usa TODOS los nombres candidatos de la factura, devuelve la menor penalización
      const nombrePenaltyFac = (fac, movNombre) => {
        const nombres = facNombres(fac);
        if (!nombres.length || !movNombre) return 0;
        const tM = tokens(movNombre);
        return Math.min(...nombres.map(n => {
          const tF = tokens(n);
          if (!tF.length) return 0;
          const matches = tF.filter(w => tM.some(wm => wm.includes(w) || w.includes(wm)));
          return (1 - matches.length / tF.length) * 8;
        }));
      };

      // Descarte duro: solo si TODOS los nombres candidatos de la factura son incompatibles con el movimiento
      // (ambos lados ≥2 tokens y sin tokens en común)
      const nombreIncompatible = (fac, movNombre) => {
        const nombres = facNombres(fac);
        if (!nombres.length || !movNombre) return false;
        const tM = tokens(movNombre);
        if (!tM.length) return false;
        // Compatible si ALGÚN nombre candidato tiene tokens en común con el movimiento
        return !nombres.some(n => {
          const tF = tokens(n);
          if (tF.length < 2 || tM.length < 2) return true; // no suficiente contexto → no descartar
          return tF.some(w => tM.some(wm => wm.includes(w) || w.includes(wm)));
        });
      };

      // Error: factura sin ningún movimiento vinculado en la junction table
      for (const fac of facturasGuardadas) {
        if (!fac.movimiento_ids || fac.movimiento_ids.length === 0) {
          const contactoReqId = fac.tipo === 'gasto' ? fac.factura_proveedor_id : fac.factura_cliente_id;
          if (contactoReqId) { // Solo si ya tiene contacto (sin_contacto ya lo cubre)
            conflictos.push({
              tipo: 'sin_movimiento_vinculado',
              factura: fac,
              severidad: 'error',
              desc: `La factura de ${fmt(Math.abs(fac.importe||0))} no tiene ningún movimiento vinculado. Vincúlala desde la pestaña Documentos.`
            });
          }
        }
      }

      // Para cada factura subida, buscar el movimiento DB más parecido
      // NOTA: fac.importe es la BASE (sin IVA). El movimiento tiene base_imponible y cantidad (total con IVA).
      for (const fac of facturasGuardadas) {
        const facBase  = Math.abs(fac.importe || 0);
        const facIva   = Math.abs(fac.impuesto || 0);
        const facTotal = facBase + facIva;
        const facTipo  = fac.tipo;

        // Error: factura sin contacto vinculado (siempre debe tener proveedor o cliente)
        const contactoReqId = facTipo === 'gasto' ? fac.factura_proveedor_id : fac.factura_cliente_id;
        if (!contactoReqId) {
          conflictos.push({ tipo: 'sin_contacto', factura: fac, severidad: 'error',
            desc: `Factura de ${fmt(facBase)} sin ${facTipo === 'gasto' ? 'proveedor' : 'cliente'} vinculado. Asigna el contacto en la pestaña Documentos.` });
          continue;
        }

        // Distancia de importes: mínimo entre 4 combinaciones base/total
        const importeDiff = m => Math.min(
          Math.abs(Math.abs(m.base_imponible || 0) - facBase),
          Math.abs(Math.abs(m.cantidad || 0) - facTotal),
          Math.abs(Math.abs(m.base_imponible || 0) - facTotal),
          Math.abs(Math.abs(m.cantidad || 0) - facBase)
        );

        // Penalización por distancia de fecha: 0.1 € por día de diferencia entre
        // la fecha de la factura (doc) y la fecha del movimiento.
        // Permite desempatar cuando dos movimientos tienen el mismo importe (ej: dos suscripciones SaaS).
        const fechaPenalty = m => {
          if (!fac.fecha_factura || !m.fecha) return 0;
          const dias = Math.abs(new Date(fac.fecha_factura) - new Date(m.fecha)) / 86400000;
          return dias * 0.1;
        };

        // 1º: movimientos con importe_factura explícito
        let candidatos = movs
          .filter(m => !movsUsados.has(m.id) && normTipo(m.tipo) === facTipo && m.importe_factura != null && !nombreIncompatible(fac, m.nombre))
          .map(m => {
            const diff = Math.min(
              Math.abs(Math.abs(m.importe_factura) - facBase),
              Math.abs(Math.abs(m.importe_factura) - facTotal)
            );
            return { m, diff, score: diff + fechaPenalty(m) + nombrePenaltyFac(fac, m.nombre) };
          })
          .filter(c => c.diff <= 1)
          .sort((a, b) => a.score - b.score);

        // 2º: movimientos con fecha_factura pero sin importe_factura — comparar por base/total
        // Umbral 2.5€ para absorber diferencias de conversión de divisa (ej: USD→EUR)
        if (!candidatos.length) {
          candidatos = movs
            .filter(m => !movsUsados.has(m.id) && normTipo(m.tipo) === facTipo && m.fecha_factura != null && m.importe_factura == null && !nombreIncompatible(fac, m.nombre))
            .map(m => {
              const diff = importeDiff(m);
              return { m, diff, score: diff + fechaPenalty(m) + nombrePenaltyFac(fac, m.nombre) };
            })
            .filter(c => c.diff <= 2.5)
            .sort((a, b) => a.score - b.score);
        }

        if (!candidatos.length) {
          conflictos.push({ tipo: 'sin_movimiento', factura: fac, severidad: 'warning',
            desc: `Factura de ${fmt(facBase)} sin movimiento en DB que tenga datos de factura asociados. Puede que el movimiento exista pero le falte rellenar "importe factura" o "fecha factura".` });
          continue;
        }

        const { m } = candidatos[0];
        movsUsados.add(m.id);

        // Movimiento fuera del trimestre actual (cross-trimestre detectado via buffer ±35 días)
        if (m._fuera_trimestre) {
          const [mY, mM] = m.fecha.split('-').map(Number);
          conflictos.push({ tipo: 'cross_trimestre', movimiento: m, factura: fac, severidad: 'error',
            desc: `El movimiento está en ${mesNom[mM-1]}-${mY}, fuera de este trimestre — la factura fue emitida en este período pero el cobro/pago cayó en otro trimestre` });
        }

        // Conflicto: desfase de fecha entre fecha_factura del doc y fecha del movimiento
        if (!m._fuera_trimestre && fac.fecha_factura && m.fecha) {
          const [fY, fM] = fac.fecha_factura.split('-').map(Number);
          const [mY, mM] = m.fecha.split('-').map(Number);
          if (fY !== mY || fM !== mM) {
            conflictos.push({ tipo: 'desfase_fecha', movimiento: m, factura: fac, severidad: 'warning',
              desc: `Factura emitida en ${mesNom[fM-1]}-${fY} pero el movimiento está registrado en ${mesNom[mM-1]}-${mY}` });
          }
        }

        // Conflicto: desfase entre fecha_factura guardada en DB y fecha del documento subido
        // Para gastos: es normal que el doc tenga fecha posterior al movimiento (ciclo de facturación).
        // Solo alertar si la diferencia es > 5 días O si el doc es anterior a la DB.
        if (fac.fecha_factura && m.fecha_factura && fac.fecha_factura !== m.fecha_factura) {
          const docDate = new Date(fac.fecha_factura);
          const dbDate  = new Date(m.fecha_factura);
          const diffDias = (docDate - dbDate) / 86400000; // positivo = doc más reciente
          const esGasto = facTipo === 'gasto';
          const esCasoNormal = esGasto && diffDias > 0 && diffDias <= 5; // doc posterior ≤5 días en compra → OK
          if (!esCasoNormal) {
            conflictos.push({ tipo: 'fecha_factura_distinta', movimiento: m, factura: fac, severidad: 'warning',
              desc: `Fecha en el documento: ${fac.fecha_factura} vs fecha de factura en DB: ${m.fecha_factura}` });
          }
        }

        // Conflicto: IVA
        const movIva = Math.abs(m.iva_a_pagar || 0);
        if (facIva > 0 && movIva === 0) {
          conflictos.push({ tipo: 'iva_faltante_db', movimiento: m, factura: fac, severidad: 'error',
            desc: `La factura refleja ${fmt(facIva)} de IVA pero el movimiento no tiene IVA registrado` });
        } else if (facIva === 0 && movIva > 0) {
          conflictos.push({ tipo: 'iva_en_db_sin_factura', movimiento: m, factura: fac, severidad: 'warning',
            desc: `El movimiento tiene ${fmt(movIva)} de IVA en DB pero la factura subida no muestra IVA` });
        } else if (facIva > 0 && movIva > 0 && Math.abs(facIva - movIva) > 1) {
          conflictos.push({ tipo: 'iva_diferente', movimiento: m, factura: fac, severidad: 'error',
            desc: `IVA en factura: ${fmt(facIva)} vs IVA en DB: ${fmt(movIva)} (diferencia ${fmt(Math.abs(facIva - movIva))})` });
        }

        // Conflicto: total pagado ≠ total factura (base + IVA)
        const movTotal = Math.abs(m.cantidad || 0);
        if (facTotal > 0 && Math.abs(movTotal - facTotal) > 1) {
          conflictos.push({ tipo: 'importe_distinto', movimiento: m, factura: fac, severidad: 'warning',
            desc: `Total cobrado/pagado: ${fmt(movTotal)} vs total factura (base+IVA): ${fmt(facTotal)}` });
        }
      }

      // Movimientos con datos de factura en DB que no matchearon con ninguna factura subida
      for (const m of movs) {
        if (!movsUsados.has(m.id) && (m.importe_factura != null || m.fecha_factura != null)) {
          conflictos.push({ tipo: 'sin_factura_subida', movimiento: m, severidad: 'info',
            desc: `Tiene ${m.importe_factura != null ? `importe_factura: ${fmt(Math.abs(m.importe_factura))}` : ''}${m.fecha_factura ? ` fecha: ${m.fecha_factura}` : ''} en DB pero ninguna factura subida coincide` });
        }
      }
  return conflictos;
}
