// Constantes compartidas del feature Finanzas — extraídas de Finanzas.jsx (Fase 15).

export const CUENTAS = [
  { key: 'Ingresos',               label: 'Ingresos',            color: '#22c55e' },
  { key: 'Impuestos',              label: 'Impuestos',           color: '#f59e0b' },
  { key: 'Compensación del Dueño', label: 'Com. Dueño',          color: '#3b82f6' },
  { key: 'Gastos de Operación',    label: 'Gastos Operación',    color: '#8b5cf6' },
  { key: 'Ganancia',               label: 'Ganancias',           color: '#10b981' },
  { key: 'Freelancers y Material', label: 'Freelancers',         color: '#ec4899' },
];

export const CATEGORIAS = [
  'Agencia','Banco','Causas Benéficas / Donaciones','Compra','Consultoría','Formación',
  'Freelancer','Gestoría','Hacienda','Herramientas / Software','Hoteles / Hostales',
  'Impuestos','Ingresar Dinero','Inversiones','Materiales','Ocio','Piso / Casa',
  'Publicidad','Sacar Dinero','Salud','Transporte y viajes','Traspaso Entre Cuentas',
];

export const IVA_OPTS  = ['0%','10%','21%'];
export const IRPF_OPTS = ['0%','7%','15%'];
export const TIPOS     = ['Ingreso','Gasto'];

export const CAMPOS_FILTRO = [
  { key: 'nombre',          label: 'Nombre',          tipo: 'text' },
  { key: 'tipo',            label: 'Tipo',            tipo: 'select',          ops: ['Ingreso','Gasto'] },
  { key: 'cuenta',          label: 'Cuenta',          tipo: 'select',          ops: CUENTAS.map(c => c.key) },
  { key: 'categorias',      label: 'Categoría',       tipo: 'array',           ops: CATEGORIAS },
  { key: 'cantidad',        label: 'Cantidad (€)',     tipo: 'number' },
  { key: 'beneficio',       label: 'Beneficio (€)',   tipo: 'number' },
  { key: 'base_imponible',  label: 'Base Imponible',  tipo: 'number' },
  { key: 'iva',             label: 'IVA',             tipo: 'select',          ops: IVA_OPTS },
  { key: 'irpf',            label: 'IRPF',            tipo: 'select',          ops: IRPF_OPTS },
  { key: 'importe_factura',   label: 'Importe s/ factura',  tipo: 'number_nullable' },
  { key: 'fecha_factura',     label: 'Fecha Factura',       tipo: 'date' },
  { key: 'created_at',        label: 'Creado',    tipo: 'date' },
  { key: 'updated_at',        label: 'Modificado', tipo: 'date' },
  { key: 'cliente_ids',       label: 'Cliente',        tipo: 'uuid_nullable' },
  { key: 'equipo_ids',        label: 'Miembro equipo', tipo: 'uuid_nullable' },
  { key: 'proveedor_ids',     label: 'Proveedor',      tipo: 'uuid_nullable' },
];

export const OPS_POR_TIPO = {
  text:            [['ilike','contiene'],['not_ilike','no contiene'],['eq','es igual a'],['is_null','está vacío'],['is_not_null','no está vacío']],
  date:            [['gte','es o después de'],['lte','es o antes de'],['gt','después de'],['lt','antes de'],['eq','es exactamente']],
  number:          [['eq','='],['neq','≠'],['gt','>'],['gte','≥'],['lt','<'],['lte','≤']],
  number_nullable: [['eq','='],['neq','≠'],['gt','>'],['gte','≥'],['lt','<'],['lte','≤'],['is_null','está vacío'],['is_not_null','no está vacío']],
  select:          [['eq','es'],['neq','no es']],
  array:           [['cs','contiene'],['not_cs','no contiene']],
  uuid_nullable:   [['is_not_null','tiene asignado'],['is_null','no tiene asignado'],['eq','es'],['neq','no es']],
};

export const CAMPOS_SORT = [
  { key: 'fecha',          label: 'Fecha' },
  { key: 'nombre',         label: 'Nombre' },
  { key: 'cantidad',       label: 'Cantidad' },
  { key: 'beneficio',      label: 'Beneficio' },
  { key: 'base_imponible', label: 'Base Imponible' },
  { key: 'fecha_factura',     label: 'Fecha Factura' },
  { key: 'importe_factura',   label: 'Importe Factura' },
  { key: 'created_at',        label: 'Creado' },
  { key: 'updated_at',        label: 'Modificado' },
  { key: 'cliente_ids',       label: 'Cliente' },
  { key: 'equipo_ids',        label: 'Miembro equipo' },
  { key: 'proveedor_ids',     label: 'Proveedor' },
];

export const CAMPOS_FILTRO_DOCS = [
  { key: 'fecha_factura',        label: 'Fecha',       tipo: 'date' },
  { key: 'numero_factura',       label: 'Nº Factura',  tipo: 'text' },
  { key: 'nombre_entidad',       label: 'Entidad',     tipo: 'text' },
  { key: 'tipo',                 label: 'Tipo',        tipo: 'select', ops: ['Venta','Compra'] },
  { key: 'factura_proveedor_id', label: 'Proveedor',   tipo: 'uuid_nullable' },
  { key: 'factura_cliente_id',   label: 'Cliente',     tipo: 'uuid_nullable' },
  { key: 'importe',              label: 'Importe',     tipo: 'number' },
  { key: 'impuesto',             label: 'IVA',         tipo: 'number' },
  { key: 'irpf',                 label: 'IRPF',        tipo: 'number' },
  { key: 'nif_cif',              label: 'NIF/CIF',     tipo: 'text' },
  { key: 'anio',                 label: 'Año',         tipo: 'number' },
  { key: 'trimestre',            label: 'Trimestre',   tipo: 'number' },
  { key: 'archivo_nombre',       label: 'Archivo',     tipo: 'text' },
];

export const CAMPOS_SORT_DOCS = [
  { key: 'fecha_factura',  label: 'Fecha' },
  { key: 'numero_factura', label: 'Nº Factura' },
  { key: 'nombre_entidad', label: 'Entidad' },
  { key: 'tipo',           label: 'Tipo' },
  { key: 'importe',        label: 'Importe' },
  { key: 'impuesto',       label: 'IVA' },
  { key: 'irpf',           label: 'IRPF' },
  { key: 'anio',           label: 'Año' },
  { key: 'trimestre',      label: 'Trimestre' },
  { key: 'archivo_nombre', label: 'Archivo' },
];

export const DIM_COLOR = { '#22c55e': '#166534', '#f87171': '#991b1b', '#f59e0b': '#92400e', '#8b5cf6': '#5b21b6' };

export const CUENTAS_OPTS = ['Ingresos','Impuestos','Compensación del Dueño','Gastos de Operación','Freelancers y Material','Ganancia'];

export const S = {
  card:    { background: '#161616', border: '1px solid #27272a', borderRadius: 12, padding: 20 },
  input:   { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  select:  { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  label:   { color: '#71717a', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 },
  primary: { background: '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  ghost:   { background: 'transparent', color: '#71717a', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' },
  danger:  { background: 'transparent', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' },
};
