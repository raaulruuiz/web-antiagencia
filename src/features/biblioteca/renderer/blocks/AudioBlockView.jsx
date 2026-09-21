import { useRef, useState } from 'react';

export function AudioPlayer({ url, color = '#f43f5e' }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const setSpeedVal = (s) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audioRef.current && duration) {
      audioRef.current.currentTime = ratio * duration;
      setProgress(ratio);
      setCurrentTime(ratio * duration);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <audio ref={audioRef} src={url} preload="metadata"
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onTimeUpdate={e => { const a = e.target; setCurrentTime(a.currentTime); setProgress(a.duration ? a.currentTime / a.duration : 0); }}
        onEnded={() => setPlaying(false)} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={toggle}
          style={{ width: 40, height: 40, borderRadius: '50%', background: color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {playing
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
          }
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div onClick={handleSeek} style={{ height: 4, background: 'var(--t-border)', borderRadius: 99, cursor: 'pointer', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress * 100}%`, background: color, borderRadius: 99 }} />
            <div style={{ position: 'absolute', top: '50%', left: `${progress * 100}%`, transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: '0 0 0 2px var(--t-bg)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t-text-subtle)' }}>
            <span>{fmt(currentTime)}</span>
            <span>{duration ? fmt(duration) : '--:--'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          {[1, 1.5, 2].map(s => (
            <button key={s} onClick={() => setSpeedVal(s)}
              style={{ background: speed === s ? color : 'transparent', border: `1px solid ${speed === s ? color : 'var(--t-border)'}`, borderRadius: 5, padding: '2px 6px', fontSize: 10, color: speed === s ? 'white' : 'var(--t-text-subtle)', cursor: 'pointer', fontWeight: speed === s ? 700 : 400 }}>
              {s === 1 ? '1x' : `${s}x`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AudioBlockView({ block, hideTitle }) {
  return (
    <div>
      {!hideTitle && block.titulo && <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t-text)', marginBottom: 4 }}>{block.titulo}</div>}
      {!hideTitle && block.subtitulo && <div style={{ fontSize: 13, color: 'var(--t-text-muted)', marginBottom: 12 }}>{block.subtitulo}</div>}
      {block.audio_url
        ? <AudioPlayer url={block.audio_url} color={block.color || '#f43f5e'} />
        : <div style={{ fontSize: 13, color: 'var(--t-text-muted)' }}>Sin audio</div>
      }
    </div>
  );
}
