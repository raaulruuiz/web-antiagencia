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

/* ─── RIR utils ───────────────────────────────────────────────── */
function parseRir(str) {
  if (!str || !String(str).trim()) return null;
  const nums = String(str).split(/[\/,\s]+/).map(Number).filter(n => !isNaN(n) && n >= 0);
  return nums.length ? nums : null;
}
function displayRir(arr) {
  if (!arr || !arr.length) return null;
  return arr.join(' / ');
}
function getRirForSet(arr, idx) {
  if (!arr || !arr.length) return null;
  return arr[idx] ?? arr[arr.length - 1];
}

/* ─── e1RM ────────────────────────────────────────────────────── */
function calcE1rm(peso, reps, rir = 0) {
  if (!peso || !reps) return null;
  return Math.round(peso * (1 + (reps + (rir || 0)) / 30));
}

/* ─── utils ───────────────────────────────────────────────────── */
function tipoBadge(tipo) {
  const t = TIPOS.find(x => x.value === tipo) ?? TIPOS[0];
  return (
    <span style={{ background: t.color + '22', color: t.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
      {t.label}
    </span>
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
function displayName(email) { return email?.split('@')[0] ?? 'Usuario'; }
function fmtRepsEx(ex) {
  if (ex.reps_min && ex.reps_max) return `${ex.reps_min}-${ex.reps_max} reps`;
  if (ex.reps_min) return `${ex.reps_min} reps`;
  if (ex.reps_objetivo) return `${ex.reps_objetivo} reps`;
  return '? reps';
}
function fmtDescanso(seg) {
  if (!seg) return null;
  const m = Math.floor(seg / 60), s = seg % 60;
  if (m && s) return `${m}m ${s}s`;
  if (m) return `${m}m`;
  return `${s}s`;
}

/* ─── text import parser ──────────────────────────────────────── */
function parseTextImport(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const exercises = [];
  for (const line of lines) {
    // Format: Nombre — NxM[-P] [— RIR N[/N...]] [— Ns]
    const m = line.match(
      /^(.+?)\s*[—\-–]\s*(\d+)x(\d+)(?:-(\d+))?\s*(?:[—\-–]\s*RIR\s*([\d\/\s]+?))?\s*(?:[—\-–]\s*(\d+)s)?\s*$/i
    );
    if (!m) continue;
    const [, nombre, series, repsMin, repsMax, rirStr, descansoStr] = m;
    exercises.push({
      nombre:            nombre.trim(),
      tipo_metrica:      'fuerza',
      series_objetivo:   parseInt(series),
      reps_min:          parseInt(repsMin),
      reps_max:          repsMax ? parseInt(repsMax) : null,
      rir_series_array:  rirStr ? parseRir(rirStr.trim()) : null,
      descanso_segundos: descansoStr ? parseInt(descansoStr) : null,
    });
  }
  return exercises;
}

/* ─── shared styles ───────────────────────────────────────────── */
const S = {
  card:    { background: '#161616', border: '1px solid #27272a', borderRadius: 12, padding: 16 },
  input:   { background: '#0d0d0d', border: '1px solid #3f3f46', borderRadius: 8, color: 'white', padding: '8px 12px', fontSize: 16, outline: 'none', width: '100%', boxSizing: 'border-box' },
  primary: { background: '#0067FD', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  ghost:   { background: 'transparent', color: '#71717a', border: '1px solid #3f3f46', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer' },
  danger:  { background: 'transparent', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer' },
  green:   { background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

/* ═══════════════════════════════════════════════════════════════
   RUTINAS
═══════════════════════════════════════════════════════════════ */
function RutinasView({ userId, onStartRoutine }) {
  const [routines,   setRoutines]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [detail,     setDetail]     = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editR,      setEditR]      = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showText,   setShowText]   = useState(false);

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

  const duplicateRoutine = async (r, e) => {
    e.stopPropagation();
    const { data: exercises } = await supabase
      .from('routine_exercises').select('*').eq('routine_id', r.id).order('orden');
    const { data: newR } = await supabase
      .from('routines').insert({ nombre: r.nombre + ' (copia)', user_id: userId }).select().single();
    if (newR && exercises?.length) {
      await supabase.from('routine_exercises').insert(
        exercises.map(({ id, routine_id, created_at, ...ex }) => ({ ...ex, routine_id: newR.id }))
      );
    }
    load();
  };

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
          <button style={{ ...S.ghost, fontSize: 13, padding: '6px 12px' }} onClick={() => setShowText(true)}>↑ Texto</button>
          <button style={{ ...S.ghost, fontSize: 13, padding: '6px 12px' }} onClick={() => setShowImport(true)}>↑ Archivo</button>
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
                title="Duplicar rutina"
                onClick={(e) => duplicateRoutine(r, e)}>⎘</button>
              <button style={{ ...S.ghost, padding: '6px 12px', fontSize: 13 }}
                onClick={() => { setEditR(r); setShowForm(true); }}>✎</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <RoutineFormModal routine={editR} userId={userId}
          onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); load(); }} />
      )}
      {showImport && (
        <FileImportModal userId={userId}
          onClose={() => setShowImport(false)} onSave={() => { setShowImport(false); load(); }} />
      )}
      {showText && (
        <TextImportModal userId={userId}
          onClose={() => setShowText(false)} onSave={() => { setShowText(false); load(); }} />
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
      <input style={S.input} placeholder="Nombre de la rutina" value={nombre}
        onChange={e => setNombre(e.target.value)} autoFocus />
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
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editEx,    setEditEx]    = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('routine_exercises').select('*').eq('routine_id', routine.id).order('orden');
    setExercises(data ?? []);
    setLoading(false);
  }, [routine.id]);

  useEffect(() => { load(); }, [load]);

  const moveExercise = async (idx, dir) => {
    const arr = [...exercises];
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= arr.length) return;
    const a = arr[idx], b = arr[tgt];
    await Promise.all([
      supabase.from('routine_exercises').update({ orden: b.orden }).eq('id', a.id),
      supabase.from('routine_exercises').update({ orden: a.orden }).eq('id', b.id),
    ]);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button style={{ ...S.ghost, padding: '6px 12px' }} onClick={onBack}>← Volver</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, flex: 1 }}>{routine.nombre}</h2>
        <button style={S.primary} onClick={() => onStart({ ...routine, routine_exercises: exercises })}>
          ▶ Entrenar
        </button>
      </div>

      {loading ? <Loader /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {exercises.map((ex, i) => (
              <div key={ex.id} style={{ ...S.card, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {/* Reorder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingTop: 3 }}>
                  <button onClick={() => moveExercise(i, -1)} disabled={i === 0}
                    style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? '#3f3f46' : '#71717a', fontSize: 11, padding: '1px 3px', lineHeight: 1 }}>▲</button>
                  <button onClick={() => moveExercise(i, 1)} disabled={i === exercises.length - 1}
                    style={{ background: 'none', border: 'none', cursor: i === exercises.length - 1 ? 'default' : 'pointer', color: i === exercises.length - 1 ? '#3f3f46' : '#71717a', fontSize: 11, padding: '1px 3px', lineHeight: 1 }}>▼</button>
                </div>
                <span style={{ color: '#52525b', fontSize: 12, paddingTop: 4, minWidth: 16 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{ex.nombre}</div>
                  <div style={{ fontSize: 12, color: '#71717a', display: 'flex', flexWrap: 'wrap', gap: '3px 10px' }}>
                    {ex.tipo_metrica === 'fuerza' && (
                      <>
                        <span>{ex.series_objetivo ?? '?'} × {fmtRepsEx(ex)}</span>
                        {ex.rir_series_array?.length > 0 && (
                          <span style={{ color: '#a78bfa' }}>RIR {displayRir(ex.rir_series_array)}</span>
                        )}
                        {ex.peso_objetivo && <span>{ex.peso_objetivo}kg obj.</span>}
                        {ex.descanso_segundos && <span>⏱ {fmtDescanso(ex.descanso_segundos)}</span>}
                      </>
                    )}
                    {ex.tipo_metrica === 'cardio' && (
                      <span>{ex.distancia_objetivo ?? '?'}km{ex.tiempo_objetivo_seg ? ` · ${Math.floor(ex.tiempo_objetivo_seg / 60)}min` : ''}</span>
                    )}
                    {ex.tipo_metrica === 'tiempo' && ex.tiempo_objetivo_seg && (
                      <span>{Math.floor(ex.tiempo_objetivo_seg / 60)}m {ex.tiempo_objetivo_seg % 60}s</span>
                    )}
                    {ex.variantes?.length > 0 && (
                      <span style={{ color: '#52525b' }}>var: {ex.variantes.join(', ')}</span>
                    )}
                  </div>
                  {ex.notas && (
                    <div style={{ fontSize: 11, color: '#52525b', marginTop: 4, fontStyle: 'italic' }}>{ex.notas}</div>
                  )}
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
          exercise={editEx} routineId={routine.id} order={exercises.length}
          onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function ExerciseFormModal({ exercise, routineId, order, onClose, onSave }) {
  const [nombre,    setNombre]    = useState(exercise?.nombre ?? '');
  const [tipo,      setTipo]      = useState(exercise?.tipo_metrica ?? 'fuerza');
  const [series,    setSeries]    = useState(exercise?.series_objetivo ?? '');
  const [repsMin,   setRepsMin]   = useState(exercise?.reps_min ?? exercise?.reps_objetivo ?? '');
  const [repsMax,   setRepsMax]   = useState(exercise?.reps_max ?? '');
  const [rirStr,    setRirStr]    = useState(exercise?.rir_series_array ? displayRir(exercise.rir_series_array) : '');
  const [pesoObj,   setPesoObj]   = useState(exercise?.peso_objetivo ?? '');
  const [descanso,  setDescanso]  = useState(exercise?.descanso_segundos ?? '');
  const [notas,     setNotas]     = useState(exercise?.notas ?? '');
  const [variantes, setVariantes] = useState(exercise?.variantes?.join(', ') ?? '');
  const [dist,      setDist]      = useState(exercise?.distancia_objetivo ?? '');
  const [tMin,      setTMin]      = useState(exercise ? Math.floor((exercise.tiempo_objetivo_seg ?? 0) / 60) : '');
  const [tSeg,      setTSeg]      = useState(exercise ? (exercise.tiempo_objetivo_seg ?? 0) % 60 : '');
  const [saving,    setSaving]    = useState(false);

  const save = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    const payload = {
      nombre,
      tipo_metrica:        tipo,
      series_objetivo:     series   ? parseInt(series)    : null,
      reps_min:            repsMin  ? parseInt(repsMin)   : null,
      reps_max:            repsMax  ? parseInt(repsMax)   : null,
      rir_series_array:    parseRir(rirStr),
      peso_objetivo:       pesoObj  ? parseFloat(pesoObj) : null,
      descanso_segundos:   descanso ? parseInt(descanso)  : null,
      notas:               notas.trim() || null,
      distancia_objetivo:  dist     ? parseFloat(dist)    : null,
      tiempo_objetivo_seg: (tMin || tSeg) ? (parseInt(tMin || 0) * 60 + parseInt(tSeg || 0)) : null,
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
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <Field label="Series">
                <input style={S.input} type="number" placeholder="4" value={series}
                  onChange={e => setSeries(e.target.value)} />
              </Field>
              <Field label="Reps mín">
                <input style={S.input} type="number" placeholder="6" value={repsMin}
                  onChange={e => setRepsMin(e.target.value)} />
              </Field>
              <Field label="Reps máx">
                <input style={S.input} type="number" placeholder="8" value={repsMax}
                  onChange={e => setRepsMax(e.target.value)} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="RIR objetivo (ej: 2/2/1)">
                <input style={S.input} placeholder="2 / 2 / 1" value={rirStr}
                  onChange={e => setRirStr(e.target.value)} />
              </Field>
              <Field label="Peso objetivo (kg)">
                <input style={S.input} type="number" step="0.5" placeholder="50" value={pesoObj}
                  onChange={e => setPesoObj(e.target.value)} />
              </Field>
            </div>
            <Field label="Descanso sugerido (segundos)">
              <input style={S.input} type="number" placeholder="120" value={descanso}
                onChange={e => setDescanso(e.target.value)} />
            </Field>
          </>
        )}
        {tipo === 'cardio' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Distancia (km)">
              <input style={S.input} type="number" step="0.1" placeholder="5" value={dist}
                onChange={e => setDist(e.target.value)} />
            </Field>
            <Field label="Tiempo (min)">
              <input style={S.input} type="number" placeholder="30" value={tMin}
                onChange={e => setTMin(e.target.value)} />
            </Field>
          </div>
        )}
        {tipo === 'tiempo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Minutos">
              <input style={S.input} type="number" placeholder="1" value={tMin}
                onChange={e => setTMin(e.target.value)} />
            </Field>
            <Field label="Segundos">
              <input style={S.input} type="number" placeholder="30" value={tSeg}
                onChange={e => setTSeg(e.target.value)} />
            </Field>
          </div>
        )}
        <Field label="Variantes (separadas por comas)">
          <input style={S.input} placeholder="Press mancuernas, Chest press máquina"
            value={variantes} onChange={e => setVariantes(e.target.value)} />
        </Field>
        <Field label="Notas">
          <input style={S.input} placeholder="Notas opcionales" value={notas}
            onChange={e => setNotas(e.target.value)} />
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
    const buf = await file.arrayBuffer();
    const wb  = XLSX.read(buf, { type: 'array' });
    return wb.SheetNames.map(name => `=== Hoja: ${name} ===\n` + XLSX.utils.sheet_to_csv(wb.Sheets[name])).join('\n\n');
  }
  return file.text();
}

function ExercisePreviewCard({ ex, index, onRemove }) {
  return (
    <div style={{ ...S.card, padding: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: '#52525b', fontSize: 12, minWidth: 22, paddingTop: 2 }}>{index + 1}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{ex.nombre}</div>
        <div style={{ fontSize: 11, color: '#71717a', marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: '3px 8px' }}>
          <span style={{ color: '#52525b' }}>{METRICA_LABELS_SHORT[ex.tipo_metrica] ?? ex.tipo_metrica}</span>
          {ex.series_objetivo ? <span>{ex.series_objetivo} series</span> : null}
          {(ex.reps_min || ex.reps_objetivo) ? <span>{ex.reps_min ?? ex.reps_objetivo}{ex.reps_max ? `-${ex.reps_max}` : ''} reps</span> : null}
          {ex.rir_series_array?.length > 0 && <span style={{ color: '#a78bfa' }}>RIR {displayRir(ex.rir_series_array)}</span>}
          {ex.descanso_segundos && <span>⏱ {fmtDescanso(ex.descanso_segundos)}</span>}
          {ex.variantes?.length ? <span>var: {ex.variantes.join(', ')}</span> : null}
          {ex.notas && <span style={{ color: '#52525b' }}>{ex.notas}</span>}
        </div>
      </div>
      <button style={{ color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, paddingTop: 2 }}
        onClick={() => onRemove(index)}>✕</button>
    </div>
  );
}

function FileImportModal({ userId, onClose, onSave }) {
  const [step,     setStep]     = useState('upload');
  const [rutinas,  setRutinas]  = useState([]);
  const [selected, setSelected] = useState([]);
  const [editing,  setEditing]  = useState(null);
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
      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();
      if (!data.rutinas?.length) throw new Error('No se detectaron rutinas en el archivo');
      setRutinas(data.rutinas);
      setSelected(data.rutinas.map((_, i) => i));
      setStep(data.rutinas.length > 1 ? 'select' : 'preview');
      if (data.rutinas.length === 1) {
        setEditing({ idx: 0, nombre: data.rutinas[0].nombre, ejercicios: data.rutinas[0].ejercicios });
      }
    } catch (e) {
      setError(e.message || 'Error desconocido');
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
      {step === 'upload' && (
        <>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>Importar rutina con IA</h3>
          <p style={{ color: '#71717a', fontSize: 13, margin: '0 0 20px' }}>
            Sube cualquier archivo. La IA detectará los ejercicios automáticamente.
          </p>
          <div
            style={{ border: '2px dashed #3f3f46', borderRadius: 10, padding: 40, textAlign: 'center', cursor: 'pointer' }}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
            <div style={{ color: '#a1a1aa', fontSize: 14 }}>Arrastra o haz clic para seleccionar</div>
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
      {step === 'parsing' && <Loader text="Analizando archivo con IA..." />}
      {step === 'saving'  && <Loader text="Creando rutinas..." />}
      {step === 'select' && (
        <>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{rutinas.length} rutinas detectadas</h3>
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
      {step === 'preview' && editing && (
        <>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>
            Vista previa{selected.length > 1 ? ` (${selected.indexOf(editing.idx) + 1}/${selected.length})` : ''}
          </h3>
          <p style={{ color: '#71717a', fontSize: 13, margin: '0 0 14px' }}>
            {editing.ejercicios.length} ejercicios detectados.
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
            {(() => {
              const currentPos = selected.indexOf(editing.idx);
              const nextIdx    = selected[currentPos + 1];
              if (nextIdx != null) {
                return (
                  <button style={S.primary} onClick={() => {
                    const updated = [...rutinas];
                    updated[editing.idx] = { nombre: editing.nombre, ejercicios: editing.ejercicios };
                    setRutinas(updated);
                    setEditing({ idx: nextIdx, nombre: rutinas[nextIdx].nombre, ejercicios: rutinas[nextIdx].ejercicios });
                  }}>Siguiente →</button>
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
   TEXT IMPORT (local parser)
═══════════════════════════════════════════════════════════════ */
function TextImportModal({ userId, onClose, onSave }) {
  const [text,    setText]    = useState('');
  const [nombre,  setNombre]  = useState('Nueva rutina');
  const [preview, setPreview] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  const parse = () => {
    const exercises = parseTextImport(text);
    if (!exercises.length) {
      setError('No se reconoció ningún ejercicio. Formato: Nombre — 4x6-8 — RIR 2 — 120s');
      return;
    }
    setError(null);
    setPreview(exercises);
  };

  const save = async () => {
    if (!preview?.length || !nombre.trim()) return;
    setSaving(true);
    const { data: routine } = await supabase
      .from('routines').insert({ nombre: nombre.trim(), user_id: userId }).select().single();
    if (routine && preview.length) {
      await supabase.from('routine_exercises').insert(
        preview.map((ex, i) => ({ ...ex, routine_id: routine.id, orden: i }))
      );
    }
    onSave();
  };

  return (
    <Modal onClose={onClose} wide>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>Importar desde texto</h3>
      {!preview ? (
        <>
          <p style={{ color: '#71717a', fontSize: 13, margin: '0 0 16px' }}>
            Un ejercicio por línea:{' '}
            <code style={{ color: '#a78bfa', fontSize: 12 }}>Nombre — 3x8-10 — RIR 2 — 120s</code>
          </p>
          <Field label="Nombre de la rutina">
            <input style={{ ...S.input, marginBottom: 10 }} value={nombre}
              onChange={e => setNombre(e.target.value)} />
          </Field>
          <textarea
            style={{ ...S.input, height: 160, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
            placeholder={'Press banca — 4x6-8 — RIR 2/2/1 — 120s\nSentadilla — 3x5-7 — RIR 1 — 180s\nJalón — 3x8-12 — RIR 2 — 90s'}
            value={text} onChange={e => setText(e.target.value)}
          />
          {error && <div style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>⚠ {error}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button style={S.ghost} onClick={onClose}>Cancelar</button>
            <button style={S.primary} onClick={parse}>Analizar →</button>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: '#71717a', fontSize: 13, margin: '0 0 12px' }}>
            {preview.length} ejercicios detectados:
          </p>
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {preview.map((ex, i) => (
              <ExercisePreviewCard key={i} ex={ex} index={i}
                onRemove={idx => setPreview(prev => prev.filter((_, j) => j !== idx))} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={S.ghost} onClick={() => setPreview(null)}>← Editar</button>
            <button style={S.primary} disabled={saving || !preview.length} onClick={save}>
              {saving ? 'Creando...' : `Crear rutina (${preview.length} ejercicios)`}
            </button>
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
      user_id:           userId,
      routine_id:        routine?.id ?? null,
      nombre:            routine?.nombre ?? 'Sesión libre',
      tipo:              routine?.tipo ?? 'gym',
      user_display_name: displayName(userEmail),
    }).select().single();
    setActiveSession({ ...data, exercises: routine?.routine_exercises ?? [] });
    setPickRoutine(false);
    setStarting(false);
  }, [userId, userEmail, setActiveSession]);

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
    return <ActiveSession session={activeSession} userId={userId} onFinish={finishSession} />;
  }

  return (
    <div style={{ textAlign: 'center', paddingTop: 48 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>¿Listo para entrenar?</h2>
      <p style={{ color: '#71717a', marginBottom: 32, fontSize: 14 }}>Elige una rutina o empieza una sesión libre</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={{ ...S.primary, padding: '12px 28px', fontSize: 15 }} onClick={() => setPickRoutine(true)}>
          Elegir rutina
        </button>
        <button style={{ ...S.ghost, padding: '12px 28px', fontSize: 15 }} onClick={() => startSession(null)}>
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

function ActiveSession({ session, userId, onFinish }) {
  const plannedExercises = session.exercises ?? [];

  const [sets,         setSets]         = useState([]);
  const [elapsed,      setElapsed]      = useState(0);
  const [guidance,     setGuidance]     = useState({});
  const [activeCards,  setActiveCards]  = useState(() => plannedExercises.map((_, i) => i));
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [exitingIdx,   setExitingIdx]   = useState(null);
  const [showTerminar, setShowTerminar] = useState(false);
  const [dragStart,    setDragStart]    = useState(null);
  const [dragOffset,   setDragOffset]   = useState(0);
  const elapsedRef = useRef(null);

  useEffect(() => {
    supabase.from('session_sets').select('*').eq('session_id', session.id)
      .order('created_at').then(({ data }) => setSets(data ?? []));
  }, [session.id]);

  useEffect(() => {
    const names = (session.exercises ?? []).map(e => e.nombre);
    if (!names.length || !userId) return;
    supabase.from('session_sets')
      .select('exercise_nombre, variante_de, peso_kg, reps, rir, distancia_km, tiempo_seg, created_at, workout_sessions!inner(user_id, terminada_at, id)')
      .eq('workout_sessions.user_id', userId)
      .not('workout_sessions.terminada_at', 'is', null)
      .neq('workout_sessions.id', session.id)
      .then(({ data }) => {
        if (!data) return;
        const g = {};
        for (const name of names) {
          const relevant = data.filter(s =>
            s.exercise_nombre === name || s.variante_de === name
          ).filter(s => s.peso_kg != null);
          if (!relevant.length) continue;
          const pr       = relevant.reduce((best, s) => s.peso_kg > (best?.peso_kg ?? 0) ? s : best, null);
          const lastTime = [...relevant].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          g[name] = {
            pr:       pr       ? { peso: pr.peso_kg,       reps: pr.reps,       rir: pr.rir }       : null,
            lastTime: lastTime ? { peso: lastTime.peso_kg, reps: lastTime.reps, rir: lastTime.rir } : null,
          };
        }
        setGuidance(g);
      });
  }, [session.exercises, session.id, userId]);

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
      session_id:          session.id,
      routine_exercise_id: routineExerciseId ?? null,
      exercise_nombre:     exerciseNombre,
      variante_de:         varianteDe ?? null,
      nro_serie:           nro,
      ...data,
    };
    const { data: newSet } = await supabase.from('session_sets').insert(payload).select().single();
    if (newSet) setSets(prev => [...prev, newSet]);
  };

  const delSet = async (id) => {
    await supabase.from('session_sets').delete().eq('id', id);
    setSets(prev => prev.filter(s => s.id !== id));
  };

  const removeCard = (exerciseIdx) => {
    setExitingIdx(exerciseIdx);
    setTimeout(() => {
      const next = activeCards.filter(i => i !== exerciseIdx);
      setActiveCards(next);
      setCurrentIdx(ci => Math.min(ci, Math.max(0, next.length - 1)));
      setExitingIdx(null);
      if (next.length === 0) setTimeout(onFinish, 500);
    }, 260);
  };

  const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), sec = elapsed % 60;
  const elapsedStr = elapsed >= 3600 ? `${h}h ${m}m` : `${m}:${sec.toString().padStart(2, '0')}`;
  const completedCount = plannedExercises.length - activeCards.length;

  const handlePointerDown = (e) => {
    if (e.target.closest('input, button, select, textarea')) return;
    setDragStart(e.clientX);
    setDragOffset(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e) => {
    if (dragStart === null) return;
    setDragOffset(e.clientX - dragStart);
  };
  const handlePointerUp = () => {
    if (dragStart !== null) {
      if (dragOffset < -70 && currentIdx < activeCards.length - 1) setCurrentIdx(ci => ci + 1);
      if (dragOffset >  70 && currentIdx > 0)                      setCurrentIdx(ci => ci - 1);
    }
    setDragStart(null);
    setDragOffset(0);
  };

  if (activeCards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Sesión completada</div>
        <div style={{ color: '#71717a', fontSize: 14 }}>{elapsedStr} · {sets.length} series registradas</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes cardOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(-20px) scale(0.97); } }`}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.nombre}
          </div>
          <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
            {completedCount} de {plannedExercises.length} · {elapsedStr}
          </div>
        </div>
        <button style={{ ...S.danger, padding: '6px 14px', fontSize: 13, flexShrink: 0 }}
          onClick={() => setShowTerminar(true)}>
          Terminar
        </button>
      </div>

      {/* ── Carrusel ── */}
      <div
        style={{ overflow: 'hidden', position: 'relative', touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div style={{
          display: 'flex',
          transform: `translateX(calc(-${currentIdx * 100}% + ${dragOffset}px))`,
          transition: dragStart !== null ? 'none' : 'transform 0.28s cubic-bezier(.4,0,.2,1)',
          willChange: 'transform',
        }}>
          {activeCards.map((exIdx) => {
            const ex     = plannedExercises[exIdx];
            const exSets = sets.filter(s => s.exercise_nombre === ex.nombre || s.variante_de === ex.nombre);
            return (
              <div key={ex.id ?? exIdx} style={{
                minWidth: '100%',
                animation: exitingIdx === exIdx ? 'cardOut 0.26s ease forwards' : 'none',
              }}>
                <ExerciseCardCarousel
                  exercise={ex}
                  orderNum={exIdx + 1}
                  sets={exSets}
                  guidance={guidance[ex.nombre]}
                  onAddSet={addSet}
                  onDelSet={delSet}
                  onListo={() => removeCard(exIdx)}
                  onOmitir={() => removeCard(exIdx)}
                />
              </div>
            );
          })}
        </div>

        {/* Flechas navegación (desktop) */}
        {currentIdx > 0 && (
          <button
            style={{ position: 'absolute', left: -10, top: '38%', transform: 'translateY(-50%)', background: '#27272a', border: '1px solid #3f3f46', color: 'white', borderRadius: 8, width: 30, height: 44, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setCurrentIdx(ci => ci - 1)}>‹</button>
        )}
        {currentIdx < activeCards.length - 1 && (
          <button
            style={{ position: 'absolute', right: -10, top: '38%', transform: 'translateY(-50%)', background: '#27272a', border: '1px solid #3f3f46', color: 'white', borderRadius: 8, width: 30, height: 44, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setCurrentIdx(ci => ci + 1)}>›</button>
        )}
      </div>

      {/* Dots */}
      {activeCards.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
          {activeCards.map((_, i) => (
            <div key={i} onClick={() => setCurrentIdx(i)}
              style={{ width: i === currentIdx ? 20 : 7, height: 7, borderRadius: 4, background: i === currentIdx ? '#0067FD' : '#3f3f46', transition: 'all 0.2s', cursor: 'pointer' }} />
          ))}
        </div>
      )}

      {/* Modal terminar */}
      {showTerminar && (
        <Modal onClose={() => setShowTerminar(false)}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🏁</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>¿Terminar sesión?</div>
            <div style={{ color: '#71717a', fontSize: 13, marginBottom: 24 }}>
              {completedCount} de {plannedExercises.length} ejercicios · {elapsedStr}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button style={{ ...S.green, width: '100%', padding: 13, fontSize: 15 }}
                onClick={() => { setShowTerminar(false); onFinish(); }}>
                Terminar y guardar
              </button>
              <button style={{ ...S.ghost, width: '100%', padding: 13 }}
                onClick={() => setShowTerminar(false)}>
                Seguir entrenando
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ExerciseCardCarousel({ exercise, orderNum, sets, guidance, onAddSet, onDelSet, onListo, onOmitir }) {
  const [peso,        setPeso]        = useState('');
  const [reps,        setReps]        = useState('');
  const [rir,         setRir]         = useState('');
  const [distancia,   setDistancia]   = useState('');
  const [tiempo,      setTiempo]      = useState('');
  const [nota,        setNota]        = useState('');
  const [showVariant, setShowVariant] = useState(false);
  const [variantName, setVariantName] = useState('');

  const metrica       = exercise.tipo_metrica ?? 'fuerza';
  const lastFuerzaSet = [...sets].reverse().find(s => s.peso_kg != null);
  const nextSetIdx    = sets.length;
  const rirObjective  = getRirForSet(exercise.rir_series_array, nextSetIdx);
  const guidancePr    = guidance?.pr;
  const guidanceLast  = guidance?.lastTime;
  const prE1rm        = guidancePr?.peso && guidancePr?.reps
    ? calcE1rm(guidancePr.peso, guidancePr.reps, guidancePr.rir ?? 0)
    : null;

  useEffect(() => {
    if (metrica !== 'fuerza') return;
    if (lastFuerzaSet) {
      setPeso(String(lastFuerzaSet.peso_kg ?? ''));
      setReps(String(lastFuerzaSet.reps ?? ''));
    }
    if (rirObjective != null) setRir(String(rirObjective));
    else if (lastFuerzaSet?.rir != null) setRir(String(lastFuerzaSet.rir));
  }, [sets.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    const exNombre   = showVariant && variantName.trim() ? variantName.trim() : exercise.nombre;
    const varianteDe = showVariant && variantName.trim() ? exercise.nombre : null;
    let data = {};
    if (metrica === 'fuerza') {
      if (!peso && !reps) return;
      data = { peso_kg: peso ? parseFloat(peso) : null, reps: reps ? parseInt(reps) : null, rir: rir !== '' ? parseInt(rir) : null };
    } else if (metrica === 'cardio') {
      data = { distancia_km: distancia ? parseFloat(distancia) : null, tiempo_seg: tiempo ? parseInt(tiempo) * 60 : null };
    } else if (metrica === 'tiempo') {
      data = { tiempo_seg: tiempo ? parseInt(tiempo) : null };
    } else {
      if (!nota.trim()) return;
      data = { notas: nota || null };
    }
    await onAddSet(exNombre, exercise.id ?? null, data, varianteDe);
    setPeso(''); setReps(''); setRir(''); setDistancia(''); setTiempo(''); setNota('');
    setShowVariant(false); setVariantName('');
  };

  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Bloque 1: Identidad ── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#52525b', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          #{orderNum}
        </div>
        <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.2, marginBottom: showVariant && variantName ? 4 : 0 }}>
          {exercise.nombre}
        </div>
        {showVariant && variantName && (
          <div style={{ fontSize: 13, color: '#f59e0b', marginTop: 3 }}>Variante: {variantName}</div>
        )}
        {exercise.notas && (
          <div style={{ fontSize: 12, color: '#52525b', fontStyle: 'italic', marginTop: 4 }}>{exercise.notas}</div>
        )}
      </div>

      {/* ── Bloque 2: Objetivo ── */}
      {(exercise.series_objetivo || exercise.rir_series_array?.length > 0) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {exercise.series_objetivo && (
            <div style={{ flex: 1, background: '#0067FD14', border: '1px solid #0067FD30', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0067FD' }}>
                {exercise.series_objetivo} × {fmtRepsEx(exercise)}
              </div>
              <div style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>objetivo</div>
            </div>
          )}
          {exercise.rir_series_array?.length > 0 && (
            <div style={{ flex: 1, background: '#7c3aed14', border: '1px solid #7c3aed30', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#a78bfa' }}>
                RIR {displayRir(exercise.rir_series_array)}
              </div>
              <div style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>por serie</div>
            </div>
          )}
        </div>
      )}

      {/* ── Bloque 3: Referencia ── */}
      {(guidancePr || guidanceLast) && (
        <div style={{ display: 'flex', gap: 20, background: '#0d0d0d', borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}>
          {guidancePr && (
            <div>
              <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>PR</div>
              <div style={{ fontSize: 13 }}>
                {guidancePr.peso}kg × {guidancePr.reps}
                {prE1rm && <span style={{ color: '#52525b', fontSize: 11 }}> (~{prE1rm}kg)</span>}
              </div>
            </div>
          )}
          {guidanceLast && (guidanceLast.peso !== guidancePr?.peso || guidanceLast.reps !== guidancePr?.reps) && (
            <div>
              <div style={{ fontSize: 10, color: '#52525b', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Última vez</div>
              <div style={{ fontSize: 13, color: '#a1a1aa' }}>
                {guidanceLast.peso}kg · {guidanceLast.reps}{guidanceLast.rir != null ? ` @RIR${guidanceLast.rir}` : ''}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bloque 4: Series ── */}
      <div style={{ marginBottom: 14 }}>
        {/* Cabecera tabla */}
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 52px 28px', gap: 4, fontSize: 10, color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 4px 6px', borderBottom: '1px solid #27272a', marginBottom: 4 }}>
          <span>S</span>
          <span>{metrica === 'fuerza' ? 'Peso' : metrica === 'cardio' ? 'Km' : 'Seg'}</span>
          <span>{metrica === 'fuerza' ? 'Reps' : metrica === 'cardio' ? 'Min' : ''}</span>
          <span style={{ textAlign: 'center' }}>{metrica === 'fuerza' ? 'RIR' : ''}</span>
          <span></span>
        </div>

        {/* Series registradas */}
        {sets.map((s, i) => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 52px 28px', gap: 4, fontSize: 14, padding: '7px 4px', borderRadius: 6, alignItems: 'center', background: i % 2 === 0 ? '#0d0d0d' : 'transparent' }}>
            <span style={{ color: '#52525b', fontSize: 12, fontWeight: 600 }}>{i + 1}</span>
            {metrica === 'fuerza' && <>
              <span>{s.peso_kg ?? '—'}kg</span>
              <span>{s.reps ?? '—'}</span>
              <span style={{ color: '#a78bfa', fontSize: 13, textAlign: 'center' }}>{s.rir != null ? s.rir : '—'}</span>
            </>}
            {metrica === 'cardio' && <>
              <span>{s.distancia_km ?? '—'}km</span>
              <span>{s.tiempo_seg ? Math.floor(s.tiempo_seg / 60) + 'min' : '—'}</span>
              <span></span>
            </>}
            {metrica === 'tiempo' && <>
              <span style={{ gridColumn: 'span 2', color: '#a1a1aa' }}>{s.tiempo_seg ? `${Math.floor(s.tiempo_seg / 60)}m ${s.tiempo_seg % 60}s` : '—'}</span>
              <span></span>
            </>}
            {metrica === 'libre' && <>
              <span style={{ gridColumn: 'span 2', color: '#a1a1aa', fontSize: 12 }}>{s.notas ?? '—'}</span>
              <span></span>
            </>}
            <button style={{ color: '#3f3f46', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0, textAlign: 'center' }}
              onClick={() => onDelSet(s.id)}>✕</button>
          </div>
        ))}

        {/* Fila de entrada */}
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 52px 28px', gap: 4, marginTop: 6, alignItems: 'center' }}>
          <span style={{ color: '#52525b', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{sets.length + 1}</span>
          {metrica === 'fuerza' && <>
            <input style={{ ...S.input, padding: '7px 8px', fontSize: 14 }}
              type="number" step="0.5" inputMode="decimal"
              placeholder={lastFuerzaSet?.peso_kg != null ? String(lastFuerzaSet.peso_kg) : 'kg'}
              value={peso} onChange={e => setPeso(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} />
            <input style={{ ...S.input, padding: '7px 8px', fontSize: 14 }}
              type="number" inputMode="numeric"
              placeholder={lastFuerzaSet?.reps != null ? String(lastFuerzaSet.reps) : 'r'}
              value={reps} onChange={e => setReps(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} />
            <input style={{ ...S.input, padding: '7px 6px', fontSize: 14, textAlign: 'center' }}
              type="number" min="0" max="5" inputMode="numeric"
              placeholder={rirObjective != null ? String(rirObjective) : 'RIR'}
              value={rir} onChange={e => setRir(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </>}
          {metrica === 'cardio' && <>
            <input style={{ ...S.input, padding: '7px 8px', fontSize: 14 }} type="number" step="0.1" inputMode="decimal" placeholder="km" value={distancia} onChange={e => setDistancia(e.target.value)} />
            <input style={{ ...S.input, padding: '7px 8px', fontSize: 14 }} type="number" inputMode="numeric" placeholder="min" value={tiempo} onChange={e => setTiempo(e.target.value)} />
            <span></span>
          </>}
          {metrica === 'tiempo' && <>
            <input style={{ ...S.input, padding: '7px 8px', fontSize: 14, gridColumn: 'span 2' }} type="number" inputMode="numeric" placeholder="seg" value={tiempo} onChange={e => setTiempo(e.target.value)} />
            <span></span>
          </>}
          {metrica === 'libre' && <>
            <input style={{ ...S.input, padding: '7px 8px', fontSize: 14, gridColumn: 'span 2' }} placeholder="nota" value={nota} onChange={e => setNota(e.target.value)} />
            <span></span>
          </>}
          <button style={{ ...S.primary, padding: '7px 0', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={submit}>+</button>
        </div>
      </div>

      {/* ── Selector variante ── */}
      {showVariant && (
        <div style={{ background: '#0d0d0d', borderRadius: 8, padding: 10, marginBottom: 12 }}>
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
          <input style={S.input} placeholder="O escribe el nombre..."
            value={variantName} onChange={e => setVariantName(e.target.value)} />
        </div>
      )}

      {/* ── Acciones secundarias ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button style={{ ...S.ghost, fontSize: 12, padding: '7px 12px' }}
          onClick={() => setShowVariant(v => !v)}>
          {showVariant ? 'Cancelar variante' : '↩ Cambiar variante'}
        </button>
        <button style={{ ...S.ghost, fontSize: 12, padding: '7px 12px' }}
          onClick={submit}>+ Serie</button>
        <button style={{ ...S.ghost, fontSize: 12, padding: '7px 12px', color: '#f87171', borderColor: '#7f1d1d', marginLeft: 'auto' }}
          onClick={onOmitir}>Omitir</button>
      </div>

      {/* ── CTA principal ── */}
      <button
        style={{ ...S.green, width: '100%', padding: '15px', fontSize: 17, fontWeight: 700, borderRadius: 10 }}
        onClick={onListo}>
        Listo ✓
      </button>
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
        const isOpen   = expanded === s.id;
        const sets     = sessionSets[s.id] ?? [];
        const exercises = [...new Set(sets.map(st => st.variante_de ?? st.exercise_nombre))];
        const totalVol  = sets.reduce((acc, st) => acc + (st.peso_kg ?? 0) * (st.reps ?? 1), 0);

        return (
          <div key={s.id} style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => toggle(s)}>
              <span style={{ fontSize: 22 }}>💪</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>{s.nombre}</div>
                <div style={{ fontSize: 12, color: '#71717a' }}>
                  {fmtDate(s.empezada_at)} · {fmtDuration(s.empezada_at, s.terminada_at)}
                  {isOpen && sets.length > 0 && ` · ${sets.length} series`}
                  {isOpen && totalVol > 0 && ` · ${Math.round(totalVol)}kg vol.`}
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
                    const exVol  = exSets.reduce((acc, st) => acc + (st.peso_kg ?? 0) * (st.reps ?? 1), 0);
                    return (
                      <div key={exNombre} style={{ marginBottom: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                          <span>{exNombre}</span>
                          {exVol > 0 && <span style={{ color: '#52525b', fontSize: 11, fontWeight: 400 }}>{Math.round(exVol)}kg vol.</span>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {exSets.map((st, i) => (
                            <div key={st.id} style={{ fontSize: 12, color: '#a1a1aa', display: 'flex', gap: 10 }}>
                              <span style={{ color: '#52525b' }}>#{i + 1}</span>
                              {st.variante_de && <span style={{ color: '#f59e0b' }}>↩ {st.exercise_nombre}</span>}
                              {st.peso_kg != null && (
                                <span>
                                  {st.peso_kg}kg × {st.reps}
                                  {st.rir != null && <span style={{ color: '#a78bfa' }}> @RIR{st.rir}</span>}
                                </span>
                              )}
                              {st.distancia_km && <span>{st.distancia_km}km</span>}
                              {st.tiempo_seg != null && !st.distancia_km && <span>{Math.floor(st.tiempo_seg / 60)}m {st.tiempo_seg % 60}s</span>}
                              {st.notas && <span style={{ color: '#52525b' }}>{st.notas}</span>}
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
  const [sessions,   setSessions]   = useState([]);
  const [selectedEx, setSelectedEx] = useState('');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('session_sets')
        .select('*, workout_sessions!inner(user_id, empezada_at, terminada_at)')
        .eq('workout_sessions.user_id', userId)
        .not('workout_sessions.terminada_at', 'is', null)
        .order('created_at', { ascending: true }),
      supabase.from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .not('terminada_at', 'is', null)
        .order('empezada_at', { ascending: false }),
    ]).then(([{ data: sets }, { data: sess }]) => {
      const setsData = sets ?? [];
      setAllSets(setsData);
      setSessions(sess ?? []);
      if (setsData.length) {
        const exs = [...new Set(setsData.map(s => s.variante_de ?? s.exercise_nombre))];
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

  // Summary stats
  const now        = new Date();
  const weekStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek   = sessions.filter(s => new Date(s.empezada_at) >= weekStart).length;
  const thisMonth  = sessions.filter(s => new Date(s.empezada_at) >= monthStart).length;
  const streak     = calcStreak(sessions);

  // Best marks per exercise (by e1RM)
  const prsByEx = {};
  for (const s of allSets) {
    if (!s.peso_kg || !s.reps) continue;
    const ex  = s.variante_de ?? s.exercise_nombre;
    const e1  = calcE1rm(s.peso_kg, s.reps, s.rir ?? 0);
    if (!prsByEx[ex] || e1 > prsByEx[ex].e1rm) {
      prsByEx[ex] = { e1rm: e1, peso: s.peso_kg, reps: s.reps, rir: s.rir };
    }
  }
  const topPrs = Object.entries(prsByEx)
    .sort((a, b) => b[1].e1rm - a[1].e1rm)
    .slice(0, 5);

  const exercises = [...new Set(allSets.map(s => s.variante_de ?? s.exercise_nombre))];

  const chartData = allSets
    .filter(s => (s.variante_de ?? s.exercise_nombre) === selectedEx && s.peso_kg != null)
    .reduce((acc, s) => {
      const date = s.workout_sessions.empezada_at.split('T')[0];
      const ex   = acc.find(a => a.rawDate === date);
      const e1   = calcE1rm(s.peso_kg, s.reps, s.rir ?? 0) ?? 0;
      if (ex) {
        ex.max    = Math.max(ex.max, s.peso_kg);
        ex.volume = (ex.volume ?? 0) + s.peso_kg * (s.reps ?? 1);
        ex.e1rm   = Math.max(ex.e1rm ?? 0, e1);
      } else {
        acc.push({ rawDate: date, max: s.peso_kg, volume: s.peso_kg * (s.reps ?? 1), e1rm: e1 });
      }
      return acc;
    }, [])
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
    .map(d => ({
      ...d,
      date: new Date(d.rawDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    }));

  const isCardioOrTime = allSets
    .filter(s => (s.variante_de ?? s.exercise_nombre) === selectedEx)
    .some(s => s.distancia_km || (s.tiempo_seg && !s.peso_kg));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ ...S.card, textAlign: 'center', padding: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0067FD' }}>{thisWeek}</div>
          <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>esta semana</div>
        </div>
        <div style={{ ...S.card, textAlign: 'center', padding: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0067FD' }}>{thisMonth}</div>
          <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>este mes</div>
        </div>
        <div style={{ ...S.card, textAlign: 'center', padding: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: streak > 2 ? '#f59e0b' : '#0067FD' }}>
            {streak > 0 ? `🔥${streak}d` : `${sessions.length}`}
          </div>
          <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>{streak > 0 ? 'racha' : 'total entrenos'}</div>
        </div>
      </div>

      {/* Top PRs */}
      {topPrs.length > 0 && (
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🏆 Mejores marcas (e1RM estimado)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {topPrs.map(([ex, pr], i) => (
              <div key={ex} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <span style={{ minWidth: 22, fontSize: 16 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span style={{ flex: 1, fontWeight: 500 }}>{ex}</span>
                <span style={{ color: '#a78bfa', fontWeight: 700 }}>{pr.e1rm}kg</span>
                <span style={{ color: '#52525b', fontSize: 11 }}>({pr.peso}×{pr.reps}{pr.rir != null ? ` @RIR${pr.rir}` : ''})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise selector */}
      <div>
        <div style={{ fontSize: 11, color: '#71717a', marginBottom: 6 }}>Ejercicio</div>
        <select style={S.input} value={selectedEx} onChange={e => setSelectedEx(e.target.value)}>
          {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>
      </div>

      {chartData.length > 0 ? (
        <>
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#a1a1aa' }}>Peso máximo por sesión (kg)</div>
            <ResponsiveContainer width="100%" height={180}>
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
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#a1a1aa' }}>e1RM estimado por sesión</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#161616', border: '1px solid #27272a', borderRadius: 8, color: 'white' }} />
                <Line type="monotone" dataKey="e1rm" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} name="e1RM" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#a1a1aa' }}>Volumen por sesión (kg × reps)</div>
            <ResponsiveContainer width="100%" height={180}>
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
            ? <p style={{ color: '#71717a', margin: 0 }}>Las gráficas de peso no aplican a este ejercicio.</p>
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

  const byUser = sessions.reduce((acc, s) => {
    const name = s.user_display_name ?? 'Usuario';
    if (!acc[name]) acc[name] = [];
    acc[name].push(s);
    return acc;
  }, {});

  const now       = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const ranking = Object.entries(byUser)
    .map(([name, us]) => ({
      name,
      streak:    calcStreak(us),
      thisWeek:  us.filter(s => new Date(s.empezada_at) >= weekStart).length,
      thisMonth: us.filter(s => new Date(s.empezada_at) >= monthStart).length,
      total:     us.length,
      avgDur:    Math.round(us.filter(s => s.terminada_at).reduce((acc, s) => acc + (new Date(s.terminada_at) - new Date(s.empezada_at)) / 60000, 0) / (us.filter(s => s.terminada_at).length || 1)),
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontSize: 13, color: '#71717a' }}>{u.thisWeek} entreno{u.thisWeek !== 1 ? 's' : ''} semana</span>
                <span style={{ fontSize: 11, color: '#52525b' }}>{u.thisMonth} este mes · {u.avgDur}min media</span>
              </div>
              {u.streak > 1 && (
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>🔥{u.streak}d</span>
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

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>Entrenos</h1>
        <p style={{ color: '#71717a', margin: 0, fontSize: 14 }}>Registra y haz seguimiento de tus entrenos</p>
      </div>

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
