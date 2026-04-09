import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BACKEND_URL, LOOM_API_KEY } from '@/lib/config';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from 'recharts';

/* ─── constants ───────────────────────────────────────────────── */
const TIPOS = [
  { value: 'gym',      label: 'Gym',      color: '#0067FD' },
  { value: 'crossfit', label: 'CrossFit', color: '#FF6B00' },
  { value: 'running',  label: 'Running',  color: '#00B86B' },
  { value: 'cardio',   label: 'Cardio',   color: '#FF0099' },
  { value: 'otro',     label: 'Otro',     color: '#7000FF' },
];
const METRICAS = [
  { value: 'fuerza', label: 'Fuerza (peso + reps)' },
  { value: 'cardio', label: 'Cardio (distancia + tiempo)' },
  { value: 'tiempo', label: 'Tiempo (plancha, etc.)' },
  { value: 'libre',  label: 'Libre' },
];
const TIPO_ICONS = { gym: '🏋️', crossfit: '⚡', running: '🏃', cardio: '❤️', otro: '💪' };

/* ─── utils ───────────────────────────────────────────────────── */
function tipoBadge(tipo) {
  const t = TIPOS.find(x => x.value === tipo) ?? TIPOS[0];
  return (
    <span style={{
      background: t.color + '22', color: t.color,
      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    }}>{t.label}</span>
  );
}

function fmtDuration(start, end) {
  const s = Math.floor((new Date(end ?? new Date()) - new Date(start)) / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return '<1m';
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

function calcStreak(sessions) {
  if (!sessions.length) return 0;
  const days = [...new Set(sessions.map(s => s.empezada_at.split('T')[0]))].sort().reverse();
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i - 1]) - new Date(days[i])) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function displayName(email) {
  return email?.split('@')[0] ?? 'Usuario';
}

/* ─── shared styles ───────────────────────────────────────────── */
const S = {
  card:    { background: '#161616', border: '1px solid #27272a', borderRadius: 12, padding: 16 },
  input:   { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  primary: { background: '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  ghost:   { background: 'transparent', color: '#71717a', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer' },
  danger:  { background: 'transparent', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer' },
  green:   { background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

/* ═══════════════════════════════════════════════════════════════
   RUTINAS
═══════════════════════════════════════════════════════════════ */
function RutinasView({ userId, onStartRoutine }) {
  const [routines,    setRoutines]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [detail,      setDetail]      = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [editR,       setEditR]       = useState(null);
  const [showImport,  setShowImport]  = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('routines')
      .select('*, routine_exercises(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setRoutines(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader />;

  if (detail) {
    return (
      <RoutineDetail
        routine={detail}
        onBack={() => { setDetail(null); load(); }}
        onStart={onStartRoutine}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Mis rutinas</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={S.ghost} onClick={() => setShowImport(true)}>↑ Importar archivo</button>
          <button style={S.primary} onClick={() => { setEditR(null); setShowForm(true); }}>+ Nueva rutina</button>
        </div>
      </div>

      {routines.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', padding: 48, color: '#71717a' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
          <div>Aún no tienes rutinas. ¡Crea la primera!</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {routines.map(r => (
          <div key={r.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => setDetail(r)}>
            <span style={{ fontSize: 24 }}>💪</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.nombre}</div>
              <div style={{ fontSize: 13, color: '#71717a' }}>
                {r.routine_exercises?.length ?? 0} ejercicio{r.routine_exercises?.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
              <button style={{ ...S.primary, padding: '6px 14px', fontSize: 13 }}
                onClick={() => onStartRoutine(r)}>▶ Entrenar</button>
              <button style={{ ...S.ghost, padding: '6px 12px', fontSize: 13 }}
                onClick={() => { setEditR(r); setShowForm(true); }}>✎</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <RoutineFormModal
          routine={editR}
          userId={userId}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); load(); }}
        />
      )}
      {showImport && (
        <FileImportModal
          userId={userId}
          onClose={() => setShowImport(false)}
          onSave={() => { setShowImport(false); load(); }}
        />
      )}
    </div>
  );
}

function RoutineFormModal({ routine, userId, onClose, onSave }) {
  const [nombre, setNombre] = useState(routine?.nombre ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    if (routine) {
      await supabase.from('routines').update({ nombre }).eq('id', routine.id);
    } else {
      await supabase.from('routines').insert({ nombre, user_id: userId });
    }
    onSave();
  };

  const del = async () => {
    if (!confirm('¿Eliminar esta rutina y todos sus ejercicios?')) return;
    await supabase.from('routines').delete().eq('id', routine.id);
    onSave();
  };

  return (
    <Modal onClose={onClose}>
      <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>
        {routine ? 'Editar rutina' : 'Nueva rutina'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input style={S.input} placeholder="Nombre de la rutina" value={nombre}
          onChange={e => setNombre(e.target.value)} autoFocus />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        {routine && <button style={S.danger} onClick={del}>Eliminar</button>}
        <button style={S.ghost} onClick={onClose}>Cancelar</button>
        <button style={S.primary} onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </Modal>
  );
}

function RoutineDetail({ routine, onBack, onStart }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editEx, setEditEx]       = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('routine_exercises')
      .select('*')
      .eq('routine_id', routine.id)
      .order('orden');
    setExercises(data ?? []);
    setLoading(false);
  }, [routine.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button style={{ ...S.ghost, padding: '6px 12px' }} onClick={onBack}>← Volver</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, flex: 1 }}>{routine.nombre}</h2>
        <button style={S.primary}
          onClick={() => onStart({ ...routine, routine_exercises: exercises })}>
          ▶ Entrenar
        </button>
      </div>

      {loading ? <Loader /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {exercises.map((ex, i) => (
              <div key={ex.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#52525b', fontSize: 12, minWidth: 20 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{ex.nombre}</div>
                  <div style={{ fontSize: 12, color: '#71717a' }}>
                    {ex.tipo_metrica === 'fuerza' &&
                      `${ex.series_objetivo ?? '?'}×${ex.reps_objetivo ?? '?'} reps${ex.peso_objetivo ? ` · ${ex.peso_objetivo}kg` : ''}`}
                    {ex.tipo_metrica === 'cardio' &&
                      `${ex.distancia_objetivo ?? '?'}km${ex.tiempo_objetivo_seg ? ` · ${Math.floor(ex.tiempo_objetivo_seg / 60)}min` : ''}`}
                    {ex.tipo_metrica === 'tiempo' && ex.tiempo_objetivo_seg &&
                      `${Math.floor(ex.tiempo_objetivo_seg / 60)}m ${ex.tiempo_objetivo_seg % 60}s`}
                    {ex.tipo_metrica === 'libre' && 'Libre'}
                    {ex.variantes?.length > 0 &&
                      <span style={{ color: '#52525b' }}> · var: {ex.variantes.join(', ')}</span>}
                  </div>
                </div>
                <button style={{ ...S.ghost, padding: '4px 10px', fontSize: 12 }}
                  onClick={() => { setEditEx(ex); setShowForm(true); }}>✎</button>
              </div>
            ))}
          </div>
          <button style={{ ...S.ghost, width: '100%', padding: 10 }}
            onClick={() => { setEditEx(null); setShowForm(true); }}>
            + Añadir ejercicio
          </button>
        </>
      )}

      {showForm && (
        <ExerciseFormModal
          exercise={editEx}
          routineId={routine.id}
          order={exercises.length}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function ExerciseFormModal({ exercise, routineId, order, onClose, onSave }) {
  const [nombre,    setNombre]    = useState(exercise?.nombre ?? '');
  const [tipo,      setTipo]      = useState(exercise?.tipo_metrica ?? 'fuerza');
  const [series,    setSeries]    = useState(exercise?.series_objetivo ?? '');
  const [reps,      setReps]      = useState(exercise?.reps_objetivo ?? '');
  const [peso,      setPeso]      = useState(exercise?.peso_objetivo ?? '');
  const [dist,      setDist]      = useState(exercise?.distancia_objetivo ?? '');
  const [tMin,      setTMin]      = useState(exercise ? Math.floor((exercise.tiempo_objetivo_seg ?? 0) / 60) : '');
  const [tSeg,      setTSeg]      = useState(exercise ? (exercise.tiempo_objetivo_seg ?? 0) % 60 : '');
  const [variantes, setVariantes] = useState(exercise?.variantes?.join(', ') ?? '');
  const [saving,    setSaving]    = useState(false);

  const save = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    const payload = {
      nombre,
      tipo_metrica:       tipo,
      series_objetivo:    series   ? parseInt(series)    : null,
      reps_objetivo:      reps     ? parseInt(reps)      : null,
      peso_objetivo:      peso     ? parseFloat(peso)    : null,
      distancia_objetivo: dist     ? parseFloat(dist)    : null,
      tiempo_objetivo_seg:(tMin || tSeg) ? (parseInt(tMin || 0) * 60 + parseInt(tSeg || 0)) : null,
      variantes: variantes.trim() ? variantes.split(',').map(v => v.trim()).filter(Boolean) : null,
    };
    if (exercise) {
      await supabase.from('routine_exercises').update(payload).eq('id', exercise.id);
    } else {
      await supabase.from('routine_exercises').insert({ ...payload, routine_id: routineId, orden: order });
    }
    onSave();
  };

  const del = async () => {
    if (!confirm('¿Eliminar este ejercicio?')) return;
    await supabase.from('routine_exercises').delete().eq('id', exercise.id);
    onSave();
  };

  return (
    <Modal onClose={onClose} wide>
      <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>
        {exercise ? 'Editar ejercicio' : 'Nuevo ejercicio'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input style={S.input} placeholder="Nombre del ejercicio" value={nombre}
          onChange={e => setNombre(e.target.value)} autoFocus />
        <select style={S.input} value={tipo} onChange={e => setTipo(e.target.value)}>
          {METRICAS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        {tipo === 'fuerza' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Field label="Series">
              <input style={S.input} type="number" placeholder="4" value={series} onChange={e => setSeries(e.target.value)} />
            </Field>
            <Field label="Reps objetivo">
              <input style={S.input} type="number" placeholder="10" value={reps} onChange={e => setReps(e.target.value)} />
            </Field>
            <Field label="Peso (kg)">
              <input style={S.input} type="number" placeholder="80" value={peso} onChange={e => setPeso(e.target.value)} />
            </Field>
          </div>
        )}
        {tipo === 'cardio' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Distancia (km)">
              <input style={S.input} type="number" step="0.1" placeholder="5" value={dist} onChange={e => setDist(e.target.value)} />
            </Field>
            <Field label="Tiempo (min)">
              <input style={S.input} type="number" placeholder="30" value={tMin} onChange={e => setTMin(e.target.value)} />
            </Field>
          </div>
        )}
        {tipo === 'tiempo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Minutos">
              <input style={S.input} type="number" placeholder="1" value={tMin} onChange={e => setTMin(e.target.value)} />
            </Field>
            <Field label="Segundos">
              <input style={S.input} type="number" placeholder="30" value={tSeg} onChange={e => setTSeg(e.target.value)} />
            </Field>
          </div>
        )}
        <Field label="Variantes (separadas por comas)">
          <input style={S.input} placeholder="Press banca mancuernas, Fondos en paralelas"
            value={variantes} onChange={e => setVariantes(e.target.value)} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        {exercise && <button style={S.danger} onClick={del}>Eliminar</button>}
        <button style={S.ghost} onClick={onClose}>Cancelar</button>
        <button style={S.primary} onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILE IMPORT (IA-powered)
═══════════════════════════════════════════════════════════════ */
const METRICA_LABELS_SHORT = { fuerza: 'Fuerza', cardio: 'Cardio', tiempo: 'Tiempo', libre: 'Libre' };

async function readFileAsText(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'xlsx' || ext === 'xls') {
    const buf  = await file.arrayBuffer();
    const wb   = XLSX.read(buf, { type: 'array' });
    // Convert all sheets to CSV text
    return wb.SheetNames.map(name => {
      const ws   = wb.Sheets[name];
      return `=== Hoja: ${name} ===\n` + XLSX.utils.sheet_to_csv(ws);
    }).join('\n\n');
  }
  return file.text();
}

function ExercisePreviewCard({ ex, index, onRemove }) {
  return (
    <div style={{ ...S.card, padding: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: '#52525b', fontSize: 12, minWidth: 22, paddingTop: 2 }}>{index + 1}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{ex.nombre}</div>
        <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>
          <span style={{ marginRight: 8, color: '#52525b' }}>{METRICA_LABELS_SHORT[ex.tipo_metrica] ?? ex.tipo_metrica}</span>
          {ex.series_objetivo     ? `${ex.series_objetivo} series · ` : ''}
          {ex.reps_objetivo       ? `${ex.reps_objetivo} reps · ` : ''}
          {ex.peso_objetivo       ? `${ex.peso_objetivo}kg · ` : ''}
          {ex.distancia_objetivo  ? `${ex.distancia_objetivo}km · ` : ''}
          {ex.tiempo_objetivo_seg ? `${Math.floor(ex.tiempo_objetivo_seg / 60)}min · ` : ''}
          {ex.variantes?.length   ? `var: ${ex.variantes.join(', ')} · ` : ''}
          {ex.notas               ? <span style={{ color: '#52525b' }}>{ex.notas}</span> : ''}
        </div>
      </div>
      <button style={{ color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, paddingTop: 2 }}
        onClick={() => onRemove(index)}>✕</button>
    </div>
  );
}

function FileImportModal({ userId, onClose, onSave }) {
  const [step,     setStep]     = useState('upload'); // upload | parsing | select | preview | saving
  const [rutinas,  setRutinas]  = useState([]);       // parsed from AI
  const [selected, setSelected] = useState([]);       // indices of routines to import
  const [editing,  setEditing]  = useState(null);     // { idx, nombre, ejercicios }
  const [error,    setError]    = useState(null);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setStep('parsing');
    try {
      const content = await readFileAsText(file);
      const res = await fetch(`${BACKEND_URL}/admin/parse-routine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': LOOM_API_KEY },
        body: JSON.stringify({ content, filename: file.name }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (!data.rutinas?.length) throw new Error('No se detectaron rutinas en el archivo');
      setRutinas(data.rutinas);
      // Pre-select all
      setSelected(data.rutinas.map((_, i) => i));
      setStep(data.rutinas.length > 1 ? 'select' : 'preview');
      if (data.rutinas.length === 1) setEditing({ idx: 0, nombre: data.rutinas[0].nombre, ejercicios: data.rutinas[0].ejercicios });
    } catch (e) {
      setError(e.message);
      setStep('upload');
    }
  };

  const saveAll = async () => {
    setStep('saving');
    for (const idx of selected) {
      const r = idx === editing?.idx
        ? { nombre: editing.nombre, ejercicios: editing.ejercicios }
        : rutinas[idx];
      const { data: routine } = await supabase
        .from('routines').insert({ nombre: r.nombre.trim(), user_id: userId }).select().single();
      if (routine && r.ejercicios?.length) {
        await supabase.from('routine_exercises').insert(
          r.ejercicios.map((ex, i) => ({ ...ex, routine_id: routine.id, orden: i }))
        );
      }
    }
    onSave();
  };

  return (
    <Modal onClose={onClose} wide>
      {/* UPLOAD */}
      {step === 'upload' && (
        <>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>Importar rutina con IA</h3>
          <p style={{ color: '#71717a', fontSize: 13, margin: '0 0 20px' }}>
            Sube cualquier archivo de rutina. La IA detectará los ejercicios automáticamente sin importar el formato.
          </p>
          <div
            style={{ border: '2px dashed #3f3f46', borderRadius: 10, padding: 40, textAlign: 'center', cursor: 'pointer' }}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
            <div style={{ color: '#a1a1aa', fontSize: 14 }}>Arrastra el archivo o haz clic para seleccionarlo</div>
            <div style={{ color: '#52525b', fontSize: 12, marginTop: 4 }}>.csv · .txt · .xlsx · .xls</div>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xls" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
          {error && <div style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>⚠ {error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button style={S.ghost} onClick={onClose}>Cancelar</button>
          </div>
        </>
      )}

      {/* PARSING */}
      {step === 'parsing' && <Loader text="Analizando archivo con IA..." />}
      {step === 'saving'  && <Loader text="Creando rutinas..." />}

      {/* SELECT (multiple routines detected) */}
      {step === 'select' && (
        <>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>
            {rutinas.length} rutinas detectadas
          </h3>
          <p style={{ color: '#71717a', fontSize: 13, margin: '0 0 16px' }}>Selecciona cuáles importar:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {rutinas.map((r, i) => {
              const checked = selected.includes(i);
              return (
                <div key={i}
                  style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderColor: checked ? '#0067FD' : '#27272a' }}
                  onClick={() => setSelected(prev => checked ? prev.filter(x => x !== i) : [...prev, i])}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? '#0067FD' : '#52525b'}`, background: checked ? '#0067FD' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {checked && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{r.nombre}</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>{r.ejercicios?.length ?? 0} ejercicios</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={S.ghost} onClick={() => setStep('upload')}>← Volver</button>
            <button style={S.primary} disabled={selected.length === 0}
              onClick={() => {
                const first = selected[0];
                setEditing({ idx: first, nombre: rutinas[first].nombre, ejercicios: rutinas[first].ejercicios });
                setStep('preview');
              }}>
              Revisar selección →
            </button>
          </div>
        </>
      )}

      {/* PREVIEW */}
      {step === 'preview' && editing && (
        <>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>
            Vista previa{selected.length > 1 ? ` (${selected.indexOf(editing.idx) + 1}/${selected.length})` : ''}
          </h3>
          <p style={{ color: '#71717a', fontSize: 13, margin: '0 0 14px' }}>
            {editing.ejercicios.length} ejercicios detectados. Puedes eliminar los que no quieras.
          </p>

          <Field label="Nombre de la rutina">
            <input style={{ ...S.input, marginBottom: 14 }} value={editing.nombre}
              onChange={e => setEditing(prev => ({ ...prev, nombre: e.target.value }))} autoFocus />
          </Field>

          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {editing.ejercicios.map((ex, i) => (
              <ExercisePreviewCard key={i} ex={ex} index={i}
                onRemove={idx => setEditing(prev => ({ ...prev, ejercicios: prev.ejercicios.filter((_, j) => j !== idx) }))} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={S.ghost} onClick={() => setStep(rutinas.length > 1 ? 'select' : 'upload')}>← Volver</button>
            {/* If more routines to review, go to next; otherwise save all */}
            {(() => {
              const currentPos = selected.indexOf(editing.idx);
              const nextIdx    = selected[currentPos + 1];
              if (nextIdx != null) {
                return (
                  <button style={S.primary} onClick={() => {
                    // Save current edits back
                    const updated = [...rutinas];
                    updated[editing.idx] = { nombre: editing.nombre, ejercicios: editing.ejercicios };
                    setRutinas(updated);
                    setEditing({ idx: nextIdx, nombre: rutinas[nextIdx].nombre, ejercicios: rutinas[nextIdx].ejercicios });
                  }}>
                    Siguiente →
                  </button>
                );
              }
              return (
                <button style={S.primary} disabled={!editing.nombre.trim()} onClick={() => {
                  const updated = [...rutinas];
                  updated[editing.idx] = { nombre: editing.nombre, ejercicios: editing.ejercicios };
                  setRutinas(updated);
                  saveAll();
                }}>
                  {selected.length > 1 ? `Crear ${selected.length} rutinas` : 'Crear rutina'}
                </button>
              );
            })()}
          </div>
        </>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENTRENAR
═══════════════════════════════════════════════════════════════ */
function EntrenarView({ userId, userEmail, activeSession, setActiveSession, pendingRoutine, onClearPending }) {
  const [routines,    setRoutines]    = useState([]);
  const [pickRoutine, setPickRoutine] = useState(false);
  const [starting,    setStarting]    = useState(false);

  useEffect(() => {
    supabase.from('routines').select('*, routine_exercises(*)').eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRoutines(data ?? []));
  }, [userId]);

  const startSession = useCallback(async (routine) => {
    setStarting(true);
    const { data } = await supabase.from('workout_sessions').insert({
      user_id:          userId,
      routine_id:       routine?.id ?? null,
      nombre:           routine?.nombre ?? 'Sesión libre',
      tipo:             routine?.tipo ?? 'gym',
      user_display_name: displayName(userEmail),
    }).select().single();
    setActiveSession({ ...data, exercises: routine?.routine_exercises ?? [] });
    setPickRoutine(false);
    setStarting(false);
  }, [userId, userEmail, setActiveSession]);

  // Auto-start if navigated from "Entrenar" button in Rutinas
  useEffect(() => {
    if (pendingRoutine && !activeSession && !starting) {
      startSession(pendingRoutine);
      onClearPending();
    }
  }, [pendingRoutine, activeSession, starting, startSession, onClearPending]);

  const finishSession = async () => {
    await supabase.from('workout_sessions')
      .update({ terminada_at: new Date().toISOString() })
      .eq('id', activeSession.id);
    setActiveSession(null);
  };

  if (starting) return <Loader text="Iniciando sesión..." />;

  if (activeSession) {
    return <ActiveSession session={activeSession} onFinish={finishSession} />;
  }

  return (
    <div style={{ textAlign: 'center', paddingTop: 48 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>¿Listo para entrenar?</h2>
      <p style={{ color: '#71717a', marginBottom: 32, fontSize: 14 }}>
        Elige una rutina o empieza una sesión libre
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={{ ...S.primary, padding: '12px 28px', fontSize: 15 }}
          onClick={() => setPickRoutine(true)}>
          Elegir rutina
        </button>
        <button style={{ ...S.ghost, padding: '12px 28px', fontSize: 15 }}
          onClick={() => startSession(null)}>
          Sesión libre
        </button>
      </div>

      {pickRoutine && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ ...S.card, width: '100%', maxWidth: 500, padding: 24, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, textAlign: 'left' }}>Elegir rutina</h3>
            {routines.length === 0
              ? <p style={{ color: '#71717a', textAlign: 'left' }}>No tienes rutinas. Créalas en la pestaña Rutinas.</p>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {routines.map(r => (
                    <button key={r.id}
                      style={{ ...S.card, border: '1px solid #3f3f46', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}
                      onClick={() => startSession(r)}>
                      <span style={{ fontSize: 22 }}>{TIPO_ICONS[r.tipo] ?? '💪'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.nombre}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {tipoBadge(r.tipo)}
                          <span style={{ fontSize: 12, color: '#71717a' }}>{r.routine_exercises?.length ?? 0} ejercicios</span>
                        </div>
                      </div>
                      <span style={{ color: '#0067FD', fontSize: 18 }}>▶</span>
                    </button>
                  ))}
                </div>
              )}
            <button style={{ ...S.ghost, width: '100%', marginTop: 12 }} onClick={() => setPickRoutine(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveSession({ session, onFinish }) {
  const [sets,      setSets]      = useState([]);
  const [timerOn,   setTimerOn]   = useState(false);
  const [timerSec,  setTimerSec]  = useState(0);
  const [elapsed,   setElapsed]   = useState(0);
  const timerRef   = useRef(null);
  const elapsedRef = useRef(null);

  useEffect(() => {
    supabase.from('session_sets').select('*').eq('session_id', session.id)
      .order('created_at').then(({ data }) => setSets(data ?? []));
  }, [session.id]);

  // Rest timer
  useEffect(() => {
    if (timerOn) {
      timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  // Elapsed time
  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - new Date(session.empezada_at)) / 1000)), 1000);
    return () => clearInterval(elapsedRef.current);
  }, [session.empezada_at]);

  const addSet = async (exerciseNombre, routineExerciseId, data, varianteDe) => {
    const nro = sets.filter(s =>
      s.exercise_nombre === exerciseNombre || s.variante_de === exerciseNombre ||
      (varianteDe && (s.exercise_nombre === varianteDe || s.variante_de === varianteDe))
    ).length + 1;
    const payload = {
      session_id: session.id,
      routine_exercise_id: routineExerciseId ?? null,
      exercise_nombre: exerciseNombre,
      variante_de: varianteDe ?? null,
      nro_serie: nro,
      ...data,
    };
    const { data: newSet } = await supabase.from('session_sets').insert(payload).select().single();
    if (newSet) setSets(prev => [...prev, newSet]);
    // auto-start rest timer
    setTimerSec(0);
    setTimerOn(true);
  };

  const delSet = async (id) => {
    await supabase.from('session_sets').delete().eq('id', id);
    setSets(prev => prev.filter(s => s.id !== id));
  };

  const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), sec = elapsed % 60;
  const elapsedStr = elapsed >= 3600 ? `${h}h ${m}m` : `${m}:${sec.toString().padStart(2, '0')}`;

  const plannedExercises = session.exercises ?? [];
  // Free exercises added during session (not in plan)
  const freeExercises = [...new Set(
    sets
      .filter(s => !plannedExercises.find(e => e.nombre === s.exercise_nombre || e.nombre === s.variante_de))
      .map(s => s.variante_de ?? s.exercise_nombre)
  )];

  return (
    <div>
      {/* Session header */}
      <div style={{ ...S.card, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{session.nombre}</div>
          <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
            {elapsedStr} · {sets.length} serie{sets.length !== 1 ? 's' : ''}
          </div>
        </div>
        {/* Rest timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {timerOn ? (
            <>
              <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#0067FD', minWidth: 52 }}>
                {Math.floor(timerSec / 60).toString().padStart(2, '0')}:{(timerSec % 60).toString().padStart(2, '0')}
              </span>
              <button style={{ ...S.ghost, padding: '4px 10px', fontSize: 12 }}
                onClick={() => { setTimerOn(false); setTimerSec(0); }}>Stop</button>
            </>
          ) : (
            <button style={{ ...S.ghost, padding: '6px 12px', fontSize: 12 }}
              onClick={() => { setTimerSec(0); setTimerOn(true); }}>⏱ Descanso</button>
          )}
        </div>
      </div>

      {/* Exercise cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        {plannedExercises.map(ex => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            sets={sets.filter(s => s.exercise_nombre === ex.nombre || s.variante_de === ex.nombre)}
            onAddSet={addSet}
            onDelSet={delSet}
          />
        ))}
        {freeExercises.map(nombre => (
          <ExerciseCard
            key={nombre}
            exercise={{ nombre, tipo_metrica: 'libre' }}
            sets={sets.filter(s => s.exercise_nombre === nombre)}
            onAddSet={addSet}
            onDelSet={delSet}
          />
        ))}
      </div>

      <FreeExerciseAdd onAdd={addSet} />

      <div style={{ marginTop: 24, paddingBottom: 32 }}>
        <button style={{ ...S.green, width: '100%', padding: '14px', fontSize: 16 }}
          onClick={() => {
            if (confirm(`¿Terminar sesión? Has registrado ${sets.length} series en ${elapsedStr}.`)) {
              onFinish();
            }
          }}>
          ✓ Terminar sesión
        </button>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, sets, onAddSet, onDelSet }) {
  const [showAdd,      setShowAdd]      = useState(false);
  const [isVariant,    setIsVariant]    = useState(false);
  const [variantName,  setVariantName]  = useState('');
  const [peso,         setPeso]         = useState('');
  const [reps,         setReps]         = useState('');
  const [distancia,    setDistancia]    = useState('');
  const [tiempo,       setTiempo]       = useState('');
  const [nota,         setNota]         = useState('');

  const lastFuerza = [...sets].reverse().find(s => s.peso_kg);

  const submit = async () => {
    const exNombre  = isVariant && variantName.trim() ? variantName.trim() : exercise.nombre;
    const varianteDe = isVariant && variantName.trim() ? exercise.nombre : null;
    const metrica   = exercise.tipo_metrica;

    let data = {};
    if (metrica === 'fuerza') {
      data = { peso_kg: peso ? parseFloat(peso) : null, reps: reps ? parseInt(reps) : null };
    } else if (metrica === 'cardio') {
      data = { distancia_km: distancia ? parseFloat(distancia) : null, tiempo_seg: tiempo ? parseInt(tiempo) * 60 : null };
    } else if (metrica === 'tiempo') {
      data = { tiempo_seg: tiempo ? parseInt(tiempo) : null };
    }
    data.notas = nota || null;

    await onAddSet(exNombre, exercise.id ?? null, data, varianteDe);
    setPeso(''); setReps(''); setDistancia(''); setTiempo(''); setNota(''); setVariantName('');
    setShowAdd(false); setIsVariant(false);
  };

  return (
    <div style={S.card}>
      {/* Exercise header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sets.length > 0 ? 10 : 0 }}>
        <span style={{ fontWeight: 700, flex: 1 }}>{exercise.nombre}</span>
        {exercise.series_objetivo && (
          <span style={{ fontSize: 12, color: '#71717a' }}>
            {exercise.series_objetivo}×{exercise.reps_objetivo}
            {exercise.peso_objetivo ? ` · ${exercise.peso_objetivo}kg` : ''}
          </span>
        )}
      </div>

      {/* Logged sets */}
      {sets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {sets.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '5px 8px', background: '#0d0d0d', borderRadius: 6 }}>
              <span style={{ color: '#52525b', minWidth: 22 }}>#{i + 1}</span>
              {s.variante_de && (
                <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 600 }}>↩ {s.exercise_nombre}</span>
              )}
              {exercise.tipo_metrica === 'fuerza' && (
                <span style={{ flex: 1 }}>{s.peso_kg ?? '—'}kg × {s.reps ?? '—'} reps</span>
              )}
              {exercise.tipo_metrica === 'cardio' && (
                <span style={{ flex: 1 }}>{s.distancia_km ?? '—'}km · {s.tiempo_seg ? Math.floor(s.tiempo_seg / 60) + 'min' : '—'}</span>
              )}
              {exercise.tipo_metrica === 'tiempo' && (
                <span style={{ flex: 1 }}>{s.tiempo_seg ? `${Math.floor(s.tiempo_seg / 60)}m ${s.tiempo_seg % 60}s` : '—'}</span>
              )}
              {exercise.tipo_metrica === 'libre' && (
                <span style={{ flex: 1, color: '#a1a1aa' }}>{s.notas ?? '—'}</span>
              )}
              <button style={{ color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                onClick={() => onDelSet(s.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Add set form */}
      {showAdd && (
        <div style={{ background: '#0d0d0d', borderRadius: 8, padding: 12, marginBottom: 10 }}>
          {/* Variant selector */}
          {isVariant && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 6, fontWeight: 600 }}>Ejercicio alternativo</div>
              {exercise.variantes?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {exercise.variantes.map(v => (
                    <button key={v}
                      style={{ ...S.ghost, padding: '4px 10px', fontSize: 12, color: variantName === v ? '#0067FD' : undefined, borderColor: variantName === v ? '#0067FD' : undefined }}
                      onClick={() => setVariantName(v)}>{v}</button>
                  ))}
                </div>
              )}
              <input style={S.input} placeholder="O escribe el nombre del ejercicio alternativo..."
                value={variantName} onChange={e => setVariantName(e.target.value)} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {exercise.tipo_metrica === 'fuerza' && (
              <>
                <Field label="Peso (kg)" style={{ flex: 1 }}>
                  <input style={S.input} type="number" step="0.5"
                    placeholder={lastFuerza?.peso_kg ?? '0'} value={peso} onChange={e => setPeso(e.target.value)} />
                </Field>
                <Field label="Reps" style={{ flex: 1 }}>
                  <input style={S.input} type="number"
                    placeholder={lastFuerza?.reps ?? exercise.reps_objetivo ?? '0'} value={reps} onChange={e => setReps(e.target.value)} />
                </Field>
              </>
            )}
            {exercise.tipo_metrica === 'cardio' && (
              <>
                <Field label="Distancia (km)" style={{ flex: 1 }}>
                  <input style={S.input} type="number" step="0.1" value={distancia} onChange={e => setDistancia(e.target.value)} />
                </Field>
                <Field label="Tiempo (min)" style={{ flex: 1 }}>
                  <input style={S.input} type="number" value={tiempo} onChange={e => setTiempo(e.target.value)} />
                </Field>
              </>
            )}
            {exercise.tipo_metrica === 'tiempo' && (
              <Field label="Tiempo (seg)" style={{ flex: 1 }}>
                <input style={S.input} type="number" value={tiempo} onChange={e => setTiempo(e.target.value)} />
              </Field>
            )}
            {exercise.tipo_metrica === 'libre' && (
              <Field label="Nota" style={{ flex: 1 }}>
                <input style={S.input} placeholder="Describe el set..." value={nota} onChange={e => setNota(e.target.value)} />
              </Field>
            )}
            <button style={{ ...S.primary, padding: '8px 16px', flexShrink: 0, alignSelf: 'flex-end' }}
              onClick={submit}>✓</button>
          </div>
          {exercise.tipo_metrica === 'fuerza' && lastFuerza && (
            <div style={{ fontSize: 11, color: '#52525b', marginTop: 6 }}>
              Último: {lastFuerza.peso_kg}kg × {lastFuerza.reps} reps
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...S.ghost, flex: 1, padding: '7px 12px', fontSize: 13 }}
          onClick={() => { setShowAdd(!showAdd); if (showAdd) { setIsVariant(false); } }}>
          {showAdd ? 'Cancelar' : '+ Añadir serie'}
        </button>
        <button
          style={{ ...S.ghost, padding: '7px 12px', fontSize: 12, color: '#f59e0b', borderColor: '#78350f' }}
          onClick={() => { setShowAdd(true); setIsVariant(true); }}>
          ↩ Variante
        </button>
      </div>
    </div>
  );
}

function FreeExerciseAdd({ onAdd }) {
  const [show,  setShow]  = useState(false);
  const [nombre,setNombre]= useState('');
  const [tipo,  setTipo]  = useState('fuerza');
  const [peso,  setPeso]  = useState('');
  const [reps,  setReps]  = useState('');
  const [dist,  setDist]  = useState('');
  const [tiempo,setTiempo]= useState('');
  const [nota,  setNota]  = useState('');

  const submit = async () => {
    if (!nombre.trim()) return;
    let data = {};
    if (tipo === 'fuerza')  data = { peso_kg: peso ? parseFloat(peso) : null, reps: reps ? parseInt(reps) : null };
    if (tipo === 'cardio')  data = { distancia_km: dist ? parseFloat(dist) : null, tiempo_seg: tiempo ? parseInt(tiempo) * 60 : null };
    if (tipo === 'tiempo')  data = { tiempo_seg: tiempo ? parseInt(tiempo) : null };
    if (tipo === 'libre')   data = { notas: nota || null };
    await onAdd(nombre.trim(), null, data, null);
    setNombre(''); setPeso(''); setReps(''); setDist(''); setTiempo(''); setNota(''); setShow(false);
  };

  if (!show) return (
    <button style={{ ...S.ghost, width: '100%', padding: 10, fontSize: 13, color: '#52525b', borderStyle: 'dashed' }}
      onClick={() => setShow(true)}>
      + Añadir ejercicio no planificado
    </button>
  );

  return (
    <div style={{ ...S.card, borderStyle: 'dashed' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input style={S.input} placeholder="Nombre del ejercicio" value={nombre}
          onChange={e => setNombre(e.target.value)} autoFocus />
        <select style={S.input} value={tipo} onChange={e => setTipo(e.target.value)}>
          {METRICAS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        {tipo === 'fuerza' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input style={S.input} type="number" placeholder="Peso (kg)" value={peso} onChange={e => setPeso(e.target.value)} />
            <input style={S.input} type="number" placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)} />
          </div>
        )}
        {tipo === 'cardio' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input style={S.input} type="number" step="0.1" placeholder="Distancia (km)" value={dist} onChange={e => setDist(e.target.value)} />
            <input style={S.input} type="number" placeholder="Tiempo (min)" value={tiempo} onChange={e => setTiempo(e.target.value)} />
          </div>
        )}
        {tipo === 'tiempo' && (
          <input style={S.input} type="number" placeholder="Tiempo (seg)" value={tiempo} onChange={e => setTiempo(e.target.value)} />
        )}
        {tipo === 'libre' && (
          <input style={S.input} placeholder="Nota" value={nota} onChange={e => setNota(e.target.value)} />
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...S.ghost, flex: 1 }} onClick={() => setShow(false)}>Cancelar</button>
          <button style={{ ...S.primary, flex: 1 }} onClick={submit}>Añadir</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HISTORIAL
═══════════════════════════════════════════════════════════════ */
function HistorialView({ userId }) {
  const [sessions,    setSessions]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState(null);
  const [sessionSets, setSessionSets] = useState({});

  useEffect(() => {
    supabase.from('workout_sessions').select('*')
      .eq('user_id', userId)
      .not('terminada_at', 'is', null)
      .order('empezada_at', { ascending: false })
      .then(({ data }) => { setSessions(data ?? []); setLoading(false); });
  }, [userId]);

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este entreno y todas sus series?')) return;
    await supabase.from('workout_sessions').delete().eq('id', sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (expanded === sessionId) setExpanded(null);
  };

  const toggle = async (session) => {
    if (expanded === session.id) { setExpanded(null); return; }
    setExpanded(session.id);
    if (!sessionSets[session.id]) {
      const { data } = await supabase.from('session_sets').select('*')
        .eq('session_id', session.id).order('created_at');
      setSessionSets(prev => ({ ...prev, [session.id]: data ?? [] }));
    }
  };

  if (loading) return <Loader />;

  if (sessions.length === 0) return (
    <div style={{ ...S.card, textAlign: 'center', padding: 48, color: '#71717a' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <div>Aún no has completado ningún entreno</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sessions.map(s => {
        const isOpen = expanded === s.id;
        const sets   = sessionSets[s.id] ?? [];
        const exercises = [...new Set(sets.map(st => st.variante_de ?? st.exercise_nombre))];

        return (
          <div key={s.id} style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => toggle(s)}>
              <span style={{ fontSize: 22 }}>💪</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>{s.nombre}</div>
                <div style={{ fontSize: 12, color: '#71717a' }}>
                  {fmtDate(s.empezada_at)} · {fmtDuration(s.empezada_at, s.terminada_at)}
                  {isOpen && sets.length > 0 && ` · ${sets.length} series`}
                </div>
              </div>
              <button style={{ ...S.danger, padding: '4px 10px', fontSize: 12 }}
                onClick={(e) => deleteSession(e, s.id)}>✕</button>
              <span style={{ color: '#71717a', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
              <div style={{ marginTop: 12, borderTop: '1px solid #27272a', paddingTop: 12 }}>
                {sets.length === 0
                  ? <div style={{ color: '#52525b', fontSize: 13 }}>Sin series registradas</div>
                  : exercises.map(exNombre => {
                    const exSets = sets.filter(st => (st.variante_de ?? st.exercise_nombre) === exNombre);
                    return (
                      <div key={exNombre} style={{ marginBottom: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{exNombre}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {exSets.map((st, i) => (
                            <div key={st.id} style={{ fontSize: 12, color: '#a1a1aa', display: 'flex', gap: 10 }}>
                              <span style={{ color: '#52525b' }}>#{i + 1}</span>
                              {st.variante_de && <span style={{ color: '#f59e0b' }}>↩ {st.exercise_nombre}</span>}
                              {st.peso_kg != null  && <span>{st.peso_kg}kg × {st.reps} reps</span>}
                              {st.distancia_km     && <span>{st.distancia_km}km</span>}
                              {st.tiempo_seg != null && !st.distancia_km && <span>{Math.floor(st.tiempo_seg / 60)}m {st.tiempo_seg % 60}s</span>}
                              {st.notas            && <span>{st.notas}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROGRESO
═══════════════════════════════════════════════════════════════ */
function ProgresoView({ userId }) {
  const [allSets,    setAllSets]    = useState([]);
  const [selectedEx, setSelectedEx] = useState('');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    supabase.from('session_sets')
      .select('*, workout_sessions!inner(user_id, empezada_at)')
      .eq('workout_sessions.user_id', userId)
      .not('workout_sessions.terminada_at', 'is', null)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setAllSets(data ?? []);
        if (data?.length) {
          const exs = [...new Set(data.map(s => s.variante_de ?? s.exercise_nombre))];
          setSelectedEx(exs[0] ?? '');
        }
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <Loader />;

  if (allSets.length === 0) return (
    <div style={{ ...S.card, textAlign: 'center', padding: 48, color: '#71717a' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
      <div>Completa algunos entrenos para ver tu progreso</div>
    </div>
  );

  const exercises = [...new Set(allSets.map(s => s.variante_de ?? s.exercise_nombre))];

  const chartData = allSets
    .filter(s => (s.variante_de ?? s.exercise_nombre) === selectedEx && s.peso_kg != null)
    .reduce((acc, s) => {
      const date = s.workout_sessions.empezada_at.split('T')[0];
      const ex   = acc.find(a => a.rawDate === date);
      if (ex) {
        ex.max    = Math.max(ex.max, s.peso_kg);
        ex.volume = (ex.volume ?? 0) + s.peso_kg * (s.reps ?? 1);
        ex.sets   = (ex.sets ?? 0) + 1;
      } else {
        acc.push({ rawDate: date, max: s.peso_kg, volume: s.peso_kg * (s.reps ?? 1), sets: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
    .map(d => ({
      ...d,
      date: new Date(d.rawDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    }));

  const isCardioOrTime = allSets.filter(s => (s.variante_de ?? s.exercise_nombre) === selectedEx).some(s => s.distancia_km || (s.tiempo_seg && !s.peso_kg));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#71717a', marginBottom: 6 }}>Ejercicio</div>
        <select style={S.input} value={selectedEx} onChange={e => setSelectedEx(e.target.value)}>
          {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>
      </div>

      {chartData.length > 0 ? (
        <>
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: '#a1a1aa' }}>
              Peso máximo por sesión (kg)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, color: 'white' }} />
                <Line type="monotone" dataKey="max" stroke="#0067FD" strokeWidth={2} dot={{ fill: '#0067FD', r: 3 }} name="kg máx" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: '#a1a1aa' }}>
              Volumen por sesión (kg × reps)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, color: 'white' }} />
                <Bar dataKey="volume" fill="#7000FF" radius={[4, 4, 0, 0]} name="volumen" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div style={{ ...S.card, padding: 24, textAlign: 'center' }}>
          {isCardioOrTime
            ? <p style={{ color: '#71717a', margin: 0 }}>Las gráficas de peso no aplican a este ejercicio. Revisa el historial para ver tus datos.</p>
            : <p style={{ color: '#71717a', margin: 0 }}>No hay suficientes datos de peso para este ejercicio todavía.</p>
          }
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SOCIAL
═══════════════════════════════════════════════════════════════ */
function SocialView() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase.from('workout_sessions').select('*')
      .not('terminada_at', 'is', null)
      .order('empezada_at', { ascending: false })
      .limit(60)
      .then(({ data }) => { setSessions(data ?? []); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  if (sessions.length === 0) return (
    <div style={{ ...S.card, textAlign: 'center', padding: 48, color: '#71717a' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
      <div>El equipo aún no ha entrenado</div>
    </div>
  );

  // Compute per-user stats
  const byUser = sessions.reduce((acc, s) => {
    const name = s.user_display_name ?? 'Usuario';
    if (!acc[name]) acc[name] = [];
    acc[name].push(s);
    return acc;
  }, {});

  const now      = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)); // Monday

  const ranking = Object.entries(byUser)
    .map(([name, us]) => ({
      name,
      streak:   calcStreak(us),
      thisWeek: us.filter(s => new Date(s.empezada_at) >= weekStart).length,
      total:    us.length,
    }))
    .sort((a, b) => b.thisWeek !== a.thisWeek ? b.thisWeek - a.thisWeek : b.streak - a.streak);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Ranking */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🏆 Ranking esta semana</div>
        {ranking.every(u => u.thisWeek === 0)
          ? <div style={{ color: '#71717a', fontSize: 13 }}>Nadie ha entrenado esta semana aún 😴</div>
          : ranking.map((u, i) => (
            <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < ranking.length - 1 ? '1px solid #1c1c1c' : 'none' }}>
              <span style={{ fontSize: 18, minWidth: 28 }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <span style={{ flex: 1, fontWeight: 600 }}>{u.name}</span>
              <span style={{ fontSize: 13, color: '#71717a' }}>{u.thisWeek} entreno{u.thisWeek !== 1 ? 's' : ''}</span>
              {u.streak > 1 && (
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>🔥 {u.streak}d</span>
              )}
            </div>
          ))
        }
      </div>

      {/* Activity feed */}
      <div style={{ fontSize: 14, fontWeight: 700 }}>📅 Actividad reciente</div>
      {sessions.slice(0, 20).map(s => (
        <div key={s.id} style={{ ...S.card, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            {TIPO_ICONS[s.tipo] ?? '💪'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{s.user_display_name ?? 'Usuario'}</span>
              <span style={{ fontSize: 11, color: '#52525b' }}>{fmtDate(s.empezada_at)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#a1a1aa' }}>
              {s.nombre} · {fmtDuration(s.empezada_at, s.terminada_at)}
            </div>
          </div>
          {tipoBadge(s.tipo)}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════ */
function Modal({ children, onClose, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...S.card, width: '100%', maxWidth: wide ? 460 : 400, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function Loader({ text = 'Cargando...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, color: '#71717a', gap: 10 }}>
      <div style={{ width: 16, height: 16, border: '2px solid #3f3f46', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      {text}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'rutinas',   label: 'Rutinas',   icon: '📋' },
  { id: 'entrenar',  label: 'Entrenar',  icon: '💪' },
  { id: 'historial', label: 'Historial', icon: '📅' },
  { id: 'progreso',  label: 'Progreso',  icon: '📈' },
  { id: 'social',    label: 'Social',    icon: '🏆' },
];

export default function Gym() {
  const [tab,            setTab]            = useState('rutinas');
  const [userId,         setUserId]         = useState(null);
  const [userEmail,      setUserEmail]      = useState(null);
  const [activeSession,  setActiveSession]  = useState(null);
  const [pendingRoutine, setPendingRoutine] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? null);
    });
  }, []);

  const handleStartRoutine = (routine) => {
    setPendingRoutine(routine);
    setTab('entrenar');
  };

  if (!userId) return <Loader />;

  return (
    <div style={{ padding: '24px 28px', maxWidth: 740, margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>Entrenos</h1>
        <p style={{ color: '#71717a', margin: 0, fontSize: 14 }}>
          Registra y haz seguimiento de tus entrenos
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, background: '#161616', borderRadius: 10, padding: 4, marginBottom: 24, border: '1px solid #27272a' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, transition: 'all 0.15s', position: 'relative',
              background: tab === t.id ? '#27272a' : 'transparent',
              color:      tab === t.id ? 'white'   : '#71717a',
            }}>
            <span style={{ display: 'block', fontSize: 16, marginBottom: 2 }}>{t.icon}</span>
            {t.label}
            {t.id === 'entrenar' && activeSession && (
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, background: '#22c55e', borderRadius: '50%' }} />
            )}
          </button>
        ))}
      </div>

      {/* Views */}
      {tab === 'rutinas'   && <RutinasView   userId={userId} onStartRoutine={handleStartRoutine} />}
      {tab === 'entrenar'  && (
        <EntrenarView
          userId={userId}
          userEmail={userEmail}
          activeSession={activeSession}
          setActiveSession={setActiveSession}
          pendingRoutine={pendingRoutine}
          onClearPending={() => setPendingRoutine(null)}
        />
      )}
      {tab === 'historial' && <HistorialView userId={userId} />}
      {tab === 'progreso'  && <ProgresoView  userId={userId} />}
      {tab === 'social'    && <SocialView />}
    </div>
  );
}
