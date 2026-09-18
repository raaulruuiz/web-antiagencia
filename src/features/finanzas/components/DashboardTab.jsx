import { DateRangePicker } from './DateRangePicker';
import { CheckLegend } from './CheckLegend';
import { MetricCard } from './MetricCard';
import { SaldoCard } from './SaldoCard';
import { CUENTAS, S } from '../constants';
import { fmt, fmtY, fmtRango, mesLabel } from '../utils';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export function DashboardTab({
  desde, hasta, comparar, desdeComp, hastaComp, dashboard, dashComp, loadingDash, loadingComp, errDash,
  handleApplyDashboard,
  viewCat, setViewCat, viewEvol, setViewEvol, viewCuenta, setViewCuenta, zoomEvol, setZoomEvol, zoomCuenta, setZoomCuenta,
  evolHidden, catHidden, ctaHidden, toggleEvol, toggleCat, toggleCta,
  scrollEvolRef, xAxisEvolRef, scrollCtaRef, xAxisCtaRef,
}) {
  const d = dashboard;
  return (
    <>
          <div style={{ marginBottom: comparar && desdeComp ? 8 : 20 }}>
            <DateRangePicker
              desde={desde} hasta={hasta} onApply={handleApplyDashboard}
              showComparar comparar={comparar} desdeComp={desdeComp} hastaComp={hastaComp}
            />
          </div>
          {comparar && desdeComp && hastaComp && (
            <p style={{ color: '#52525b', fontSize: 12, marginBottom: 16 }}>
              Comparando con <span style={{ color: '#71717a', fontWeight: 500 }}>{fmtRango(desdeComp, hastaComp)}</span>
              {loadingComp && <span style={{ marginLeft: 8 }}>·&nbsp;cargando…</span>}
            </p>
          )}

          {loadingDash ? <p style={{ color: '#52525b' }}>Cargando…</p> : errDash ? (
            <p style={{ color: '#f87171', fontSize: 13, background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px' }}>Error: {errDash}</p>
          ) : d?.resumen ? (
            <>
              {(() => { const dc = dashComp?.resumen; return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 20 }}>
                <MetricCard label="Ingresos"      value={fmt(d.resumen.totalIngresos)}  color="#22c55e" compValue={dc ? dc.totalIngresos : null} />
                <MetricCard label="Gastos"        value={fmt(d.resumen.totalGastos)}    color="#f87171" compValue={dc ? dc.totalGastos : null} />
                <MetricCard label="Beneficio"     value={fmt(d.resumen.beneficioNeto)}  color={d.resumen.beneficioNeto >= 0 ? '#22c55e' : '#f87171'} compValue={dc ? dc.beneficioNeto : null} />
                <MetricCard label="IVA a pagar"   value={fmt(d.resumen.ivaAPagar)}      color="#f59e0b" compValue={dc ? dc.ivaAPagar : null} />
                <MetricCard label="IRPF retenido" value={fmt(d.resumen.irpfRetenido)}   color="#8b5cf6" compValue={dc ? dc.irpfRetenido : null} />
              </div>
              ); })()}

              <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Saldo por cuenta</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: 10, marginBottom: 24 }}>
                {CUENTAS.map(c => <SaldoCard key={c.key} cuenta={{ ...c, saldo: d.saldos[c.key] ?? 0 }} compSaldo={dashComp ? (dashComp.saldos[c.key] ?? 0) : null} />)}
              </div>

              {d.evolucionMensual.length > 1 && (() => {
                const gran = d.granularidad || 'mes';
                const MESES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                const multiAnio = new Set(d.evolucionMensual.map(e => e.mes.slice(0, 4))).size > 1;
                const tituloGran = '';
                const numBars1 = dashComp ? 6 : 3;
                const barW = gran === 'dia'
                  ? Math.max(1, Math.min(dashComp ? 10 : 20, Math.floor(600 / (d.evolucionMensual.length * numBars1))))
                  : gran === 'anio' ? (dashComp ? 18 : 36) : (dashComp ? 9 : 18);

                function fmtEjeLabel(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const [anio, mes] = key.split('-');
                    const label = mesLabel(key);
                    return multiAnio && mes === '01' ? `${label} '${anio.slice(2)}` : label;
                  }
                  // dia: yyyy-mm-dd
                  const dt = new Date(key + 'T12:00:00');
                  const d2 = dt.getDate();
                  const mo = MESES_CORTO[dt.getMonth()];
                  return multiAnio ? `${d2} ${mo} '${String(dt.getFullYear()).slice(2)}` : `${d2} ${mo}`;
                }

                function fmtTooltipLabel(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') return `${mesLabel(key)} ${key.slice(0, 4)}`;
                  const dt = new Date(key + 'T12:00:00');
                  return `${dt.getDate()} ${MESES_CORTO[dt.getMonth()]} ${dt.getFullYear()}`;
                }

                const evolData = d.evolucionMensual.map((e, i) => {
                  const c = dashComp?.evolucionMensual?.[i];
                  return { mes: e.mes, ingresos: e.ingresos, gastos: e.gastos, beneficio: e.beneficio, ...(c ? { ingresosAnt: c.ingresos, gastosAnt: c.gastos, beneficioAnt: c.beneficio } : {}) };
                });
                const evolTooltip = ({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const curr = payload.filter(p => !String(p.dataKey).endsWith('Ant'));
                  const ant  = payload.filter(p =>  String(p.dataKey).endsWith('Ant'));
                  return (
                    <div style={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                      <p style={{ color: '#71717a', margin: '0 0 6px', fontWeight: 600 }}>{fmtTooltipLabel(label)}</p>
                      {curr.map(e => <p key={e.dataKey} style={{ color: e.color || e.fill || e.stroke, margin: '2px 0' }}>{e.name}: {fmt(e.value)}</p>)}
                      {ant.length > 0 && <><div style={{ borderTop: '1px solid #27272a', margin: '5px 0' }} />{ant.map(e => <p key={e.dataKey} style={{ color: e.color || e.fill || e.stroke, margin: '2px 0' }}>{e.name}: {fmt(e.value)}</p>)}</>}
                    </div>
                  );
                };
                const evolAxes = (
                  <>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickFormatter={fmtEjeLabel} />
                    <YAxis tickFormatter={fmtY} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={evolTooltip} />
                  </>
                );
                // Zoom: calcular dominio Y para sincronizar eje fijo y gráfica scrollable
                const evolYVals = evolData.flatMap(e => [e.ingresos||0, e.gastos||0, e.beneficio||0, e.ingresosAnt||0, e.gastosAnt||0, e.beneficioAnt||0]);
                const evolYMin = Math.min(0, ...evolYVals);
                const evolYMax = Math.max(0, ...evolYVals);
                const evolYPad = Math.max((evolYMax - evolYMin) * 0.08, 10);
                const evolDomain = [Math.floor(evolYMin - evolYPad), Math.ceil(evolYMax + evolYPad)];
                const evolTicks = (() => {
                  const [lo, hi] = evolDomain;
                  return Array.from({ length: 5 }, (_, i) => Math.round(lo + (hi - lo) * i / 4));
                })();
                const EVOL_Y_W = 52;
                const pxPerPtEvol = zoomEvol === 1 ? 50 : 100;
                const zWidthEvol = Math.max(900, evolData.length * pxPerPtEvol);
                const zBarWEvol = zoomEvol === 2 ? (dashComp ? 22 : 32) : (dashComp ? 14 : 20);
                const zIntervalEvol = Math.max(0, Math.floor(evolData.length / 15));
                const ZOOM_H    = 200;
                const ZOOM_XH   = 30;
                const ZOOM_M    = { top: 5, right: 10, left: 0, bottom: 5 };
                const ZOOM_MX   = { top: 0, right: 10, left: 0, bottom: 5 };

                const evolLegendItems = [
                  { name: 'Ingresos', color: '#22c55e' }, { name: 'Gastos', color: '#f87171' }, { name: 'Beneficio', color: '#60a5fa' },
                  ...(dashComp ? [{ name: 'Ingresos ant.', color: '#166534' }, { name: 'Gastos ant.', color: '#991b1b' }, { name: 'Beneficio ant.', color: '#1d4ed8' }] : []),
                ];

                const evolBars = () => (<>
                  <Bar dataKey="ingresos"    name="Ingresos"      fill="#22c55e" radius={[4,4,0,0]} hide={!!evolHidden['ingresos']} />
                  <Bar dataKey="gastos"      name="Gastos"        fill="#f87171" radius={[4,4,0,0]} hide={!!evolHidden['gastos']} />
                  <Bar dataKey="beneficio"   name="Beneficio"     fill="#60a5fa" radius={[4,4,0,0]} hide={!!evolHidden['beneficio']} />
                  {dashComp && <Bar dataKey="ingresosAnt"  name="Ingresos ant."  fill="#166534" radius={[3,3,0,0]} hide={!!evolHidden['ingresos']} />}
                  {dashComp && <Bar dataKey="gastosAnt"    name="Gastos ant."    fill="#991b1b" radius={[3,3,0,0]} hide={!!evolHidden['gastos']} />}
                  {dashComp && <Bar dataKey="beneficioAnt" name="Beneficio ant." fill="#1d4ed8" radius={[3,3,0,0]} hide={!!evolHidden['beneficio']} />}
                </>);
                const evolLines = (<>
                  <Line dataKey="ingresos"    name="Ingresos"      stroke="#22c55e" strokeWidth={2} dot={false} connectNulls hide={!!evolHidden['ingresos']} />
                  <Line dataKey="gastos"      name="Gastos"        stroke="#f87171" strokeWidth={2} dot={false} connectNulls hide={!!evolHidden['gastos']} />
                  <Line dataKey="beneficio"   name="Beneficio"     stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls hide={!!evolHidden['beneficio']} />
                  {dashComp && <Line dataKey="ingresosAnt"  name="Ingresos ant."  stroke="#166534" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls hide={!!evolHidden['ingresos']} />}
                  {dashComp && <Line dataKey="gastosAnt"    name="Gastos ant."    stroke="#991b1b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls hide={!!evolHidden['gastos']} />}
                  {dashComp && <Line dataKey="beneficioAnt" name="Beneficio ant." stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls hide={!!evolHidden['beneficio']} />}
                </>);

                // Ejes del modo zoom: XAxis fuera del chart (scroll sincronizado), sin Legend
                const zoomedAxesEvol = (<>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mes" hide />
                  <YAxis hide domain={evolDomain} ticks={evolTicks} />
                  <Tooltip content={evolTooltip} />
                </>);

                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Evolución</h2>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[[0,'Auto'],[1,'×1'],[2,'×2']].map(([v, label]) => (
                          <button key={v} onClick={() => setZoomEvol(v)} style={{ background: zoomEvol === v ? (v === 0 ? '#27272a' : '#0067FD') : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: zoomEvol === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                        <div style={{ width: 1, background: '#3f3f46', margin: '0 2px' }} />
                        {[['barras','Barras'],['lineas','Líneas']].map(([v, label]) => (
                          <button key={v} onClick={() => setViewEvol(v)} style={{ background: viewEvol === v ? '#27272a' : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: viewEvol === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ ...S.card, marginBottom: 24, padding: '16px 8px' }}>
                      {zoomEvol > 0 ? (
                        <>
                          {/* Leyenda fuera del chart para no afectar la altura del área */}
                          <CheckLegend
                            items={[{key:'ingresos',name:'Ingresos',color:'#22c55e'},{key:'gastos',name:'Gastos',color:'#f87171'},{key:'beneficio',name:'Beneficio',color:'#60a5fa'}]}
                            hidden={evolHidden} onToggle={toggleEvol}
                            style={{ marginBottom: 6, paddingLeft: EVOL_Y_W + 4 }}
                          />
                          <div style={{ display: 'flex' }}>
                            {/* Eje Y fijo: labels HTML con posición matemática exacta */}
                            <div style={{ width: EVOL_Y_W, flexShrink: 0, position: 'relative', height: ZOOM_H }}>
                              {evolTicks.map(v => {
                                const frac = (v - evolDomain[0]) / (evolDomain[1] - evolDomain[0]);
                                const y = ZOOM_M.top + (ZOOM_H - ZOOM_M.top - ZOOM_M.bottom) * (1 - frac);
                                return (
                                  <div key={v} style={{ position: 'absolute', top: y, left: 0, right: 4, fontSize: 11, color: '#71717a', textAlign: 'right', lineHeight: 1, transform: 'translateY(-50%)' }}>
                                    {fmtY(v)}
                                  </div>
                                );
                              })}
                            </div>
                            {/* Área scrollable: solo barras, sin XAxis */}
                            <div ref={scrollEvolRef} style={{ flex: 1, overflowX: 'auto' }}
                              onScroll={e => { if (xAxisEvolRef.current) xAxisEvolRef.current.scrollLeft = e.target.scrollLeft; }}>
                              {viewEvol === 'barras' ? (
                                <BarChart width={zWidthEvol} height={ZOOM_H} data={evolData} barSize={zBarWEvol} margin={ZOOM_M}>
                                  {zoomedAxesEvol}{evolBars()}
                                </BarChart>
                              ) : (
                                <LineChart width={zWidthEvol} height={ZOOM_H} data={evolData} margin={ZOOM_M}>
                                  {zoomedAxesEvol}{evolLines}
                                </LineChart>
                              )}
                            </div>
                          </div>
                          {/* Eje X fijo: scroll sincronizado con las barras */}
                          <div style={{ display: 'flex' }}>
                            <div style={{ width: EVOL_Y_W, flexShrink: 0 }} />
                            <div ref={xAxisEvolRef} style={{ flex: 1, overflowX: 'hidden', pointerEvents: 'none' }}>
                              <BarChart width={zWidthEvol} height={ZOOM_XH} data={evolData} margin={ZOOM_MX}>
                                <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} interval={zIntervalEvol} tickFormatter={fmtEjeLabel} />
                              </BarChart>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckLegend
                            items={[{key:'ingresos',name:'Ingresos',color:'#22c55e'},{key:'gastos',name:'Gastos',color:'#f87171'},{key:'beneficio',name:'Beneficio',color:'#60a5fa'}]}
                            hidden={evolHidden} onToggle={toggleEvol}
                            style={{ marginBottom: 8, paddingLeft: 8 }}
                          />
                          <ResponsiveContainer width="100%" height={200}>
                            {viewEvol === 'barras' ? (
                              <BarChart barSize={barW} data={evolData}>
                                {evolAxes}{evolBars()}
                              </BarChart>
                            ) : (
                              <LineChart data={evolData}>
                                {evolAxes}{evolLines}
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </>
                      )}
                    </div>
                  </>
                );
              })()}

              {Object.keys(d.gastosPorCategoria).length > 0 && (() => {
                const ROJOS = ['#ef4444','#fca5a5','#dc2626','#fda4af','#b91c1c','#fb7185','#991b1b','#f43f5e','#7f1d1d','#e11d48','#ff6b6b','#be123c','#ff8a80','#9f1239'];
                const gran = d.granularidad || 'mes';
                const MESES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                const multiAnio = new Set((d.evolucionPorCategoria?.datos || []).map(e => e.periodo.slice(0, 4))).size > 1;

                function fmtEjeCat(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const [anio, mes] = key.split('-');
                    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                    const label = meses[parseInt(mes, 10) - 1];
                    return multiAnio && mes === '01' ? `${label} '${anio.slice(2)}` : label;
                  }
                  const dt = new Date(key + 'T12:00:00');
                  const mo = MESES_CORTO[dt.getMonth()];
                  return multiAnio ? `${dt.getDate()} ${mo} '${String(dt.getFullYear()).slice(2)}` : `${dt.getDate()} ${mo}`;
                }

                function fmtTipCat(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                    return `${meses[parseInt(key.split('-')[1], 10) - 1]} ${key.slice(0, 4)}`;
                  }
                  const dt = new Date(key + 'T12:00:00');
                  return `${dt.getDate()} ${MESES_CORTO[dt.getMonth()]} ${dt.getFullYear()}`;
                }

                const todasCats = d.todasCategorias || Object.keys(d.gastosPorCategoria).sort((a,b) => (d.gastosPorCategoria[b]||0) - (d.gastosPorCategoria[a]||0));
                const entries = todasCats.map(cat => [cat, d.gastosPorCategoria[cat] || 0]);
                const compCats = dashComp?.gastosPorCategoria || {};
                const allVals = [...entries.map(([,v]) => v), ...entries.map(([cat]) => compCats[cat] || 0)].filter(v => v > 0);
                const max = Math.max(...allVals, 1);
                const cats = d.evolucionPorCategoria?.categorias || [];
                const datosEvo = d.evolucionPorCategoria?.datos || [];

                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Gastos por categoría</h2>
                      {datosEvo.length > 1 && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[['total','Total'],['evolucion','Evolución']].map(([v, label]) => (
                            <button key={v} onClick={() => setViewCat(v)} style={{
                              background: viewCat === v ? '#27272a' : 'transparent',
                              border: '1px solid #27272a', borderRadius: 6,
                              color: viewCat === v ? '#fff' : '#71717a',
                              fontSize: 11, padding: '3px 10px', cursor: 'pointer',
                            }}>{label}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {viewCat === 'total' ? (
                      <div style={S.card}>
                        {entries.map(([cat, total]) => {
                          const pct = Math.round((total / max) * 100);
                          const compTotal = compCats[cat] || 0;
                          const compPct = dashComp ? Math.round((compTotal / max) * 100) : 0;
                          return (
                            <div key={cat} style={{ marginBottom: dashComp ? 14 : 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: dashComp ? 3 : 0 }}>
                                <span style={{ color: '#a1a1aa', fontSize: 12, minWidth: 140, flexShrink: 0 }}>{cat}</span>
                                <div style={{ flex: 1, background: '#27272a', borderRadius: 4, height: 6 }}>
                                  <div style={{ width: `${pct}%`, background: '#f87171', borderRadius: 4, height: 6 }} />
                                </div>
                                <span style={{ color: '#f87171', fontSize: 12, minWidth: 60, textAlign: 'right', flexShrink: 0 }}>{fmt(total)}</span>
                              </div>
                              {dashComp && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ minWidth: 140, flexShrink: 0 }} />
                                  <div style={{ flex: 1, background: '#1f1f1f', borderRadius: 4, height: 4 }}>
                                    <div style={{ width: `${compPct}%`, background: '#991b1b', borderRadius: 4, height: 4 }} />
                                  </div>
                                  <span style={{ color: '#991b1b', fontSize: 11, minWidth: 60, textAlign: 'right', flexShrink: 0 }}>{fmt(compTotal)}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ ...S.card, padding: '16px 8px' }}>
                        <CheckLegend
                          items={cats.map((cat, i) => ({ key: cat, name: cat, color: ROJOS[i % ROJOS.length] }))}
                          hidden={catHidden} onToggle={toggleCat}
                          style={{ marginBottom: 8, paddingLeft: 8 }}
                        />
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart data={datosEvo.map((e, i) => {
                            const c = dashComp?.evolucionPorCategoria?.datos?.[i];
                            return { ...e, ...(c ? cats.reduce((acc, cat) => ({ ...acc, [cat + 'Ant']: c[cat] || 0 }), {}) : {}) };
                          })}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="periodo" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}
                              interval="preserveStartEnd" tickFormatter={fmtEjeCat} />
                            <YAxis tickFormatter={fmtY} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                              position={{ y: 10 }}
                              wrapperStyle={{ zIndex: 100 }}
                              content={({ active, label }) => {
                                if (!active) return null;
                                const idx = datosEvo.findIndex(e => e.periodo === label);
                                const punto = datosEvo[idx];
                                const compPunto = dashComp?.evolucionPorCategoria?.datos?.[idx];
                                return (
                                  <div style={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
                                    <p style={{ color: '#71717a', margin: '0 0 8px', fontWeight: 600, fontSize: 12 }}>{fmtTipCat(label)}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                      {cats.map((cat, i) => (
                                        <div key={cat} style={{ marginBottom: dashComp ? 6 : 3 }}>
                                          <p style={{ color: ROJOS[i % ROJOS.length], margin: 0 }}>{cat}: {fmt(punto?.[cat] || 0)}</p>
                                          {dashComp && <p style={{ color: ROJOS[i % ROJOS.length], opacity: 0.5, margin: '1px 0 0 6px' }}>ant.: {fmt(compPunto?.[cat] || 0)}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }}
                            />
                            {cats.map((cat, i) => (
                              <Line key={cat} type="monotone" dataKey={cat} name={cat}
                                stroke={ROJOS[i % ROJOS.length]} strokeWidth={2} dot={false} connectNulls hide={!!catHidden[cat]} />
                            ))}
                            {dashComp && cats.map((cat, i) => (
                              <Line key={cat + 'Ant'} type="monotone" dataKey={cat + 'Ant'} name={cat + ' ant.'}
                                stroke={ROJOS[i % ROJOS.length]} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} dot={false} connectNulls legendType="none" hide={!!catHidden[cat]} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                );
              })()}

              {d.evolucionPorCuenta?.datos?.length > 1 && (() => {
                const CUENTA_COLORS = {
                  'Ingresos': '#22c55e', 'Impuestos': '#f59e0b',
                  'Compensación del Dueño': '#3b82f6', 'Gastos de Operación': '#8b5cf6',
                  'Ganancia': '#10b981', 'Freelancers y Material': '#ec4899',
                };
                const CUENTA_LABELS = {
                  'Ingresos': 'Ingresos', 'Impuestos': 'Impuestos',
                  'Compensación del Dueño': 'Comp. Dueño', 'Gastos de Operación': 'Gastos Op.',
                  'Ganancia': 'Ganancias', 'Freelancers y Material': 'Freelancers',
                };
                const gran = d.granularidad || 'mes';
                const MESES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                const cuentas = d.evolucionPorCuenta.cuentas;
                const multiAnio = new Set(d.evolucionPorCuenta.datos.map(e => e.periodo.slice(0, 4))).size > 1;
                const numBars3 = dashComp ? 12 : 6;
                const barW = gran === 'dia'
                  ? Math.max(1, Math.min(dashComp ? 6 : 12, Math.floor(600 / (d.evolucionPorCuenta.datos.length * numBars3))))
                  : gran === 'anio' ? (dashComp ? 12 : 24) : (dashComp ? 6 : 12);

                function fmtEjeCta(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const [anio, mes] = key.split('-');
                    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                    const label = meses[parseInt(mes, 10) - 1];
                    return multiAnio && mes === '01' ? `${label} '${anio.slice(2)}` : label;
                  }
                  const dt = new Date(key + 'T12:00:00');
                  const mo = MESES_CORTO[dt.getMonth()];
                  return multiAnio ? `${dt.getDate()} ${mo} '${String(dt.getFullYear()).slice(2)}` : `${dt.getDate()} ${mo}`;
                }

                function fmtTipCta(key) {
                  if (gran === 'anio') return key;
                  if (gran === 'mes') {
                    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                    return `${meses[parseInt(key.split('-')[1], 10) - 1]} ${key.slice(0, 4)}`;
                  }
                  const dt = new Date(key + 'T12:00:00');
                  return `${dt.getDate()} ${MESES_CORTO[dt.getMonth()]} ${dt.getFullYear()}`;
                }

                const ctaData = d.evolucionPorCuenta.datos.map((e, i) => {
                  const c = dashComp?.evolucionPorCuenta?.datos?.[i];
                  return { ...e, ...(c ? cuentas.reduce((acc, k) => ({ ...acc, [k + 'Ant']: c[k] || 0 }), {}) : {}) };
                });

                const ctaTooltip = ({ active, label }) => {
                  if (!active) return null;
                  const idx = ctaData.findIndex(e => e.periodo === label);
                  const punto = ctaData[idx];
                  const compPunto = dashComp?.evolucionPorCuenta?.datos?.[idx];
                  return (
                    <div style={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                      <p style={{ color: '#71717a', margin: '0 0 6px', fontWeight: 600 }}>{fmtTipCta(label)}</p>
                      {cuentas.map(c => (
                        <div key={c} style={{ marginBottom: dashComp ? 4 : 2 }}>
                          <p style={{ color: CUENTA_COLORS[c], margin: 0 }}>{CUENTA_LABELS[c]}: {fmt(punto?.[c] || 0)}</p>
                          {dashComp && <p style={{ color: CUENTA_COLORS[c], opacity: 0.5, margin: '1px 0 0 8px', fontSize: 11 }}>ant.: {fmt(compPunto?.[c] || 0)}</p>}
                        </div>
                      ))}
                    </div>
                  );
                };

                const ctaAxes = (
                  <>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="periodo" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickFormatter={fmtEjeCta} />
                    <YAxis tickFormatter={fmtY} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={ctaTooltip} />
                  </>
                );

                // Zoom cuentas
                const ctaYVals = ctaData.flatMap(e => cuentas.flatMap(c => [e[c]||0, e[c+'Ant']||0]));
                const ctaYMin = Math.min(0, ...ctaYVals);
                const ctaYMax = Math.max(0, ...ctaYVals);
                const ctaYPad = Math.max((ctaYMax - ctaYMin) * 0.08, 10);
                const ctaDomain = [Math.floor(ctaYMin - ctaYPad), Math.ceil(ctaYMax + ctaYPad)];
                const ctaTicks = (() => {
                  const [lo, hi] = ctaDomain;
                  return Array.from({ length: 5 }, (_, i) => Math.round(lo + (hi - lo) * i / 4));
                })();
                const CTA_Y_W = 52;
                const pxPerPtCta = zoomCuenta === 1 ? 70 : 140;
                const zWidthCta = Math.max(900, ctaData.length * pxPerPtCta);
                const zBarWCta = zoomCuenta === 2 ? (dashComp ? 12 : 18) : (dashComp ? 8 : 14);
                const zIntervalCta = Math.max(0, Math.floor(ctaData.length / 15));
                const CTA_H  = 220;
                const CTA_XH = 30;
                const CTA_M  = { top: 5, right: 10, left: 0, bottom: 5 };
                const CTA_MX = { top: 0, right: 10, left: 0, bottom: 5 };

                const ctaLegendItems = cuentas.map(c => ({ name: CUENTA_LABELS[c], color: CUENTA_COLORS[c] }));

                const zoomedAxesCta = (<>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="periodo" hide />
                  <YAxis hide domain={ctaDomain} ticks={ctaTicks} />
                  <Tooltip content={ctaTooltip} />
                </>);

                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 24 }}>
                      <h2 style={{ color: '#71717a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Evolución por cuenta</h2>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[[0,'Auto'],[1,'×1'],[2,'×2']].map(([v, label]) => (
                          <button key={v} onClick={() => setZoomCuenta(v)} style={{ background: zoomCuenta === v ? (v === 0 ? '#27272a' : '#0067FD') : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: zoomCuenta === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                        <div style={{ width: 1, background: '#3f3f46', margin: '0 2px' }} />
                        {[['barras','Barras'],['lineas','Líneas']].map(([v, label]) => (
                          <button key={v} onClick={() => setViewCuenta(v)} style={{ background: viewCuenta === v ? '#27272a' : 'transparent', border: '1px solid #27272a', borderRadius: 6, color: viewCuenta === v ? '#fff' : '#71717a', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ ...S.card, marginBottom: 24, padding: '16px 8px' }}>
                      {zoomCuenta > 0 ? (
                        <>
                          <CheckLegend
                            items={cuentas.map(c => ({ key: c, name: CUENTA_LABELS[c], color: CUENTA_COLORS[c] }))}
                            hidden={ctaHidden} onToggle={toggleCta}
                            style={{ marginBottom: 6, paddingLeft: CTA_Y_W + 4 }}
                          />
                          <div style={{ display: 'flex' }}>
                            {/* Eje Y fijo: labels HTML con posición matemática exacta */}
                            <div style={{ width: CTA_Y_W, flexShrink: 0, position: 'relative', height: CTA_H }}>
                              {ctaTicks.map(v => {
                                const frac = (v - ctaDomain[0]) / (ctaDomain[1] - ctaDomain[0]);
                                const y = CTA_M.top + (CTA_H - CTA_M.top - CTA_M.bottom) * (1 - frac);
                                return (
                                  <div key={v} style={{ position: 'absolute', top: y, left: 0, right: 4, fontSize: 11, color: '#71717a', textAlign: 'right', lineHeight: 1, transform: 'translateY(-50%)' }}>
                                    {fmtY(v)}
                                  </div>
                                );
                              })}
                            </div>
                            {/* Área scrollable: solo barras, sin XAxis */}
                            <div ref={scrollCtaRef} style={{ flex: 1, overflowX: 'auto' }}
                              onScroll={e => { if (xAxisCtaRef.current) xAxisCtaRef.current.scrollLeft = e.target.scrollLeft; }}>
                              {viewCuenta === 'barras' ? (
                                <BarChart width={zWidthCta} height={CTA_H} data={ctaData} barSize={zBarWCta} margin={CTA_M}>
                                  {zoomedAxesCta}
                                  {cuentas.map(c => <Bar key={c} dataKey={c} name={CUENTA_LABELS[c]} fill={CUENTA_COLORS[c]} radius={[4,4,0,0]} hide={!!ctaHidden[c]} />)}
                                  {dashComp && cuentas.map(c => <Bar key={c+'Ant'} dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} fill={CUENTA_COLORS[c]} fillOpacity={0.4} radius={[3,3,0,0]} legendType="none" hide={!!ctaHidden[c]} />)}
                                </BarChart>
                              ) : (
                                <LineChart width={zWidthCta} height={CTA_H} data={ctaData} margin={CTA_M}>
                                  {zoomedAxesCta}
                                  {cuentas.map(c => <Line key={c} type="monotone" dataKey={c} name={CUENTA_LABELS[c]} stroke={CUENTA_COLORS[c]} strokeWidth={2} dot={false} connectNulls hide={!!ctaHidden[c]} />)}
                                  {dashComp && cuentas.map(c => <Line key={c+'Ant'} type="monotone" dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} stroke={CUENTA_COLORS[c]} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} dot={false} connectNulls legendType="none" hide={!!ctaHidden[c]} />)}
                                </LineChart>
                              )}
                            </div>
                          </div>
                          {/* Eje X fijo: scroll sincronizado con las barras */}
                          <div style={{ display: 'flex' }}>
                            <div style={{ width: CTA_Y_W, flexShrink: 0 }} />
                            <div ref={xAxisCtaRef} style={{ flex: 1, overflowX: 'hidden', pointerEvents: 'none' }}>
                              <BarChart width={zWidthCta} height={CTA_XH} data={ctaData} margin={CTA_MX}>
                                <XAxis dataKey="periodo" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} interval={zIntervalCta} tickFormatter={fmtEjeCta} />
                              </BarChart>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckLegend
                            items={cuentas.map(c => ({ key: c, name: CUENTA_LABELS[c], color: CUENTA_COLORS[c] }))}
                            hidden={ctaHidden} onToggle={toggleCta}
                            style={{ marginBottom: 8, paddingLeft: 8 }}
                          />
                          <ResponsiveContainer width="100%" height={220}>
                            {viewCuenta === 'barras' ? (
                              <BarChart barSize={barW} data={ctaData}>
                                {ctaAxes}
                                {cuentas.map(c => <Bar key={c} dataKey={c} name={CUENTA_LABELS[c]} fill={CUENTA_COLORS[c]} radius={[4,4,0,0]} hide={!!ctaHidden[c]} />)}
                                {dashComp && cuentas.map(c => <Bar key={c+'Ant'} dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} fill={CUENTA_COLORS[c]} fillOpacity={0.4} radius={[3,3,0,0]} legendType="none" hide={!!ctaHidden[c]} />)}
                              </BarChart>
                            ) : (
                              <LineChart data={ctaData}>
                                {ctaAxes}
                                {cuentas.map(c => <Line key={c} type="monotone" dataKey={c} name={CUENTA_LABELS[c]} stroke={CUENTA_COLORS[c]} strokeWidth={2} dot={false} connectNulls hide={!!ctaHidden[c]} />)}
                                {dashComp && cuentas.map(c => <Line key={c+'Ant'} type="monotone" dataKey={c+'Ant'} name={CUENTA_LABELS[c]+' ant.'} stroke={CUENTA_COLORS[c]} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} dot={false} connectNulls legendType="none" hide={!!ctaHidden[c]} />)}
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </>
                      )}
                    </div>
                  </>
                );
              })()}
            </>
          ) : null}
    </>
  );
}
