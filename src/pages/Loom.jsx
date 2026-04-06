import { useState, useRef, useEffect, useCallback } from 'react';
import { BACKEND_URL, LOOM_API_KEY } from '@/lib/config';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const BUBBLE_SIZE = 240;


function formatTime(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function drawCamCircle(ctx, camVideo, cx, cy, size) {
  if (!camVideo || !camVideo.videoWidth) return;
  const r = size / 2;
  const vw = camVideo.videoWidth, vh = camVideo.videoHeight;
  const side = Math.min(vw, vh);
  const sx = (vw - side) / 2, sy = (vh - side) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx + r, cy + r, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(camVideo, sx, sy, side, side, cx, cy, size, size);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx + r, cy + r, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

// ── PiP panel (rendered via portal into the floating window) ──────────────────
function PiPPanel({ status, elapsed, countdown, cameraOn, getCameraStream, onPause, onResume, onStop }) {
  const videoRef = useRef(null);
  const isActive = status === 'recording' || status === 'paused';

  useEffect(() => {
    const stream = getCameraStream();
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOn, getCameraStream]);

  return (
    <div style={{
      background: '#0d0d0d',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      padding: 20,
      fontFamily: 'system-ui, sans-serif',
      boxSizing: 'border-box',
    }}>
      {/* Camera bubble */}
      {cameraOn && (
        <div style={{ position: 'relative', width: 150, height: 150, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.18)', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', flexShrink: 0 }}>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', pointerEvents: 'none' }} />
          {countdown > 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ color: 'white', fontSize: 52, fontWeight: 700, lineHeight: 1 }}>{countdown}</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>Grabando en...</span>
            </div>
          )}
        </div>
      )}

      {/* Countdown (no camera) */}
      {!cameraOn && countdown > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#71717a', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' }}>Grabando en</span>
          <span style={{ color: 'white', fontSize: 80, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>{countdown}</span>
        </div>
      )}

      {/* Status + timer */}
      {isActive && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'recording' ? '#ef4444' : '#eab308', animation: status === 'recording' ? 'pulse 1.5s infinite' : 'none' }} />
            <span style={{ color: '#71717a', fontSize: 12 }}>{status === 'recording' ? 'Grabando' : 'En pausa'}</span>
          </div>
          <span style={{ color: 'white', fontSize: 42, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 3 }}>{formatTime(elapsed)}</span>
        </div>
      )}

      {/* Controls */}
      {(isActive || countdown > 0) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {isActive && (
            status === 'recording'
              ? <button onClick={onPause} style={pipBtn}>Pausar</button>
              : <button onClick={onResume} style={pipBtn}>Reanudar</button>
          )}
          {isActive && (
            <button onClick={onStop} style={{ ...pipBtn, background: 'rgba(255,255,255,0.92)', color: '#000', fontWeight: 600 }}>Detener</button>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

const pipBtn = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.85)',
  borderRadius: 999,
  padding: '7px 16px',
  fontSize: 13,
  cursor: 'pointer',
};

// ─────────────────────────────────────────────────────────────────────────────

export default function Loom() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [status, setStatus] = useState('idle');
  const [cameraOn, setCameraOn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copiar link');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pipContainer, setPipContainer] = useState(null); // portal mount point

  const [bubblePos, setBubblePos] = useState({
    x: window.innerWidth - BUBBLE_SIZE - 40,
    y: window.innerHeight - BUBBLE_SIZE - 120,
  });

  // Mutable refs (for draw loops — avoid stale closures)
  const bubblePosRef = useRef(bubblePos);
  const statusRef = useRef('idle');
  const countdownRef = useRef(0);
  const cameraStreamRef = useRef(null);
  const rVfcActiveRef = useRef(false);

  // DOM video refs
  const cameraVideoRef = useRef(null);   // 1×1 hidden — always decodes frames for canvas
  const bubbleVideoRef = useRef(null);   // visible in idle bubble

  // Recording (created dynamically)
  const screenVideoRef = useRef(null);
  const recordingCanvasRef = useRef(null);
  const screenStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const blobRef = useRef(null);
  const timerRef = useRef(null);
  const docPiPRef = useRef(null);

  const setStatusSync = (s) => { statusRef.current = s; setStatus(s); };
  const setCountdownSync = (n) => { countdownRef.current = n; setCountdown(n); };

  // Stable getter for camera stream (passed to PiPPanel)
  const getCameraStream = useCallback(() => cameraStreamRef.current, []);

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/admin/login');
      else setSessionChecked(true);
    });
  }, [navigate]);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  // ── MediaSession (pause/stop from Chrome media hub, any tab) ───────────────
  useEffect(() => {
    const active = status === 'recording' || status === 'paused';
    try {
      if (active) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: status === 'recording' ? 'Grabando' : 'Pausado' });
        navigator.mediaSession.playbackState = status === 'recording' ? 'playing' : 'paused';
        navigator.mediaSession.setActionHandler('pause', pauseRecording);
        navigator.mediaSession.setActionHandler('play', resumeRecording);
        navigator.mediaSession.setActionHandler('stop', stopRecording);
      } else {
        ['pause', 'play', 'stop'].forEach(a => {
          try { navigator.mediaSession.setActionHandler(a, null); } catch (_) {}
        });
      }
    } catch (_) {}
  }, [status]);

  // ── Camera management ───────────────────────────────────────────────────────
  useEffect(() => {
    if (cameraOn) startCameraStream();
    else stopCameraStream();
  }, [cameraOn]);

  const startCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      cameraStreamRef.current = stream;
      await new Promise(r => setTimeout(r, 0));
      for (const ref of [cameraVideoRef, bubbleVideoRef]) {
        if (ref.current) {
          ref.current.srcObject = stream;
          ref.current.play().catch(() => {});
        }
      }
    } catch (err) {
      setErrorMsg('No se pudo acceder a la cámara: ' + err.message);
      setCameraOn(false);
    }
  };

  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    for (const ref of [cameraVideoRef, bubbleVideoRef]) {
      if (ref.current) ref.current.srcObject = null;
    }
  };

  // ── Document PiP ────────────────────────────────────────────────────────────
  const openDocPiP = useCallback(async () => {
    if (!window.documentPictureInPicture) {
      setErrorMsg('Requiere Chrome 116 o superior.');
      return;
    }
    if (docPiPRef.current) return; // already open

    try {
      const pipWin = await window.documentPictureInPicture.requestWindow({
        width: 260,
        height: cameraOn ? 400 : 260,
      });
      docPiPRef.current = pipWin;

      // Copy styles so the panel renders correctly
      [...document.querySelectorAll('style, link[rel="stylesheet"]')].forEach(el => {
        try { pipWin.document.head.appendChild(el.cloneNode(true)); } catch (_) {}
      });
      pipWin.document.body.style.cssText = 'margin:0;padding:0;background:#0d0d0d;';

      const container = pipWin.document.createElement('div');
      pipWin.document.body.appendChild(container);
      setPipContainer(container);

      // Poll instead of pagehide — pagehide fires in unexpected situations
      // (e.g. tab focus changes) causing premature cleanup
      const closePoller = setInterval(() => {
        if (pipWin.closed) {
          clearInterval(closePoller);
          setPipContainer(null);
          docPiPRef.current = null;
        }
      }, 500);
    } catch (err) {
      if (err.name !== 'NotAllowedError') setErrorMsg('No se pudo abrir la ventana flotante: ' + err.message);
    }
  }, [cameraOn]);

  const closeDocPiP = () => {
    if (docPiPRef.current) {
      docPiPRef.current.close();
      docPiPRef.current = null;
      setPipContainer(null);
    }
  };

  // ── Recording canvas (requestVideoFrameCallback — no background throttling) ─
  const startRecordingDrawLoop = useCallback(() => {
    const screenVideo = screenVideoRef.current;
    const canvas = recordingCanvasRef.current;
    if (!screenVideo || !canvas) return;

    rVfcActiveRef.current = true;

    const draw = () => {
      if (!rVfcActiveRef.current) return;
      const ctx = canvas.getContext('2d');

      if (screenVideo.readyState >= 2) {
        if (canvas.width !== screenVideo.videoWidth) {
          canvas.width = screenVideo.videoWidth || 1280;
          canvas.height = screenVideo.videoHeight || 720;
        }
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      }

      const camVideo = cameraVideoRef.current;
      if (camVideo && cameraStreamRef.current && camVideo.readyState >= 2 && camVideo.videoWidth > 0) {
        const pos = bubblePosRef.current;
        const cx = (pos.x / window.innerWidth) * canvas.width;
        const cy = (pos.y / window.innerHeight) * canvas.height;
        const bSize = (BUBBLE_SIZE / window.innerWidth) * canvas.width;
        drawCamCircle(ctx, camVideo, cx, cy, bSize);
      }

      // Countdown in recording
      if (countdownRef.current > 0) {
        const n = countdownRef.current;
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const r = Math.min(canvas.width, canvas.height) * 0.1;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = `bold ${r * 1.6}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.toString(), cx, cy);
        ctx.restore();
      }

      if (rVfcActiveRef.current) {
        screenVideo.requestVideoFrameCallback(draw);
      }
    };

    screenVideo.requestVideoFrameCallback(draw);
  }, []);

  // ── Drag (idle bubble) ──────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startPosX = bubblePosRef.current.x, startPosY = bubblePosRef.current.y;
    const onMove = (ev) => {
      const newPos = {
        x: Math.max(0, Math.min(window.innerWidth - BUBBLE_SIZE, startPosX + ev.clientX - startX)),
        y: Math.max(0, Math.min(window.innerHeight - BUBBLE_SIZE - 70, startPosY + ev.clientY - startY)),
      };
      bubblePosRef.current = newPos;
      setBubblePos({ ...newPos });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  // ── Start recording ─────────────────────────────────────────────────────────
  const startRecording = async () => {
    setErrorMsg('');
    setDriveLink('');
    setUploadStatus('');
    setElapsed(0);
    chunksRef.current = [];

    // Launch PiP and screen picker concurrently — both need a user gesture,
    // doing them in parallel keeps both within the same gesture context
    const [pipResult, screenResult] = await Promise.allSettled([
      window.documentPictureInPicture
        ? window.documentPictureInPicture.requestWindow({ width: 260, height: cameraOn ? 400 : 260 })
        : Promise.reject(new Error('unsupported')),
      navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true }),
    ]);

    // Screen capture cancelled or failed — abort
    if (screenResult.status === 'rejected') {
      if (pipResult.status === 'fulfilled') pipResult.value.close();
      if (screenResult.reason?.name !== 'NotAllowedError') {
        setErrorMsg('No se pudo iniciar: ' + screenResult.reason?.message);
      }
      return;
    }

    const screenStream = screenResult.value;
    screenStreamRef.current = screenStream;
    const displaySurface = screenStream.getVideoTracks()[0]?.getSettings()?.displaySurface;

    // Set up PiP window for controls — always, including full screen
    if (pipResult.status === 'fulfilled') {
      const pipWin = pipResult.value;
      docPiPRef.current = pipWin;
      [...document.querySelectorAll('style, link[rel="stylesheet"]')].forEach(el => {
        try { pipWin.document.head.appendChild(el.cloneNode(true)); } catch (_) {}
      });
      pipWin.document.body.style.cssText = 'margin:0;padding:0;background:#0d0d0d;';
      const container = pipWin.document.createElement('div');
      pipWin.document.body.appendChild(container);
      setPipContainer(container);
      const closePoller = setInterval(() => {
        if (pipWin.closed) {
          clearInterval(closePoller);
          setPipContainer(null);
          docPiPRef.current = null;
        }
      }, 500);
    }

    try {
      if (!screenVideoRef.current) {
        const v = document.createElement('video');
        v.muted = true; v.playsInline = true;
        screenVideoRef.current = v;
      }
      screenVideoRef.current.srcObject = screenStream;
      await screenVideoRef.current.play();

      await new Promise(r => setTimeout(r, 200));

      // ── Audio / video stream assembly ───────────────────────────────────────
      let finalStream;

      if (!cameraStreamRef.current) {
        // No camera: mix screen audio + microphone
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        const screenAudioTracks = screenStream.getAudioTracks();
        const micAudioTracks = micStream ? micStream.getAudioTracks() : [];
        const allAudioTracks = [...screenAudioTracks, ...micAudioTracks];

        finalStream = new MediaStream([screenStream.getVideoTracks()[0]]);
        if (allAudioTracks.length === 1) {
          finalStream.addTrack(allAudioTracks[0]);
        } else if (allAudioTracks.length > 1) {
          const audioCtx = new AudioContext();
          await audioCtx.resume();
          const dest = audioCtx.createMediaStreamDestination();
          allAudioTracks.forEach(t =>
            audioCtx.createMediaStreamSource(new MediaStream([t])).connect(dest)
          );
          finalStream.addTrack(dest.stream.getAudioTracks()[0]);
        }
      } else {
        // Camera on: composite screen + camera bubble on canvas
        if (!recordingCanvasRef.current) {
          recordingCanvasRef.current = document.createElement('canvas');
        }
        const canvasStream = recordingCanvasRef.current.captureStream(30);
        const allAudioTracks = [
          ...screenStream.getAudioTracks(),
          ...cameraStreamRef.current.getAudioTracks(),
        ];

        finalStream = new MediaStream();
        finalStream.addTrack(canvasStream.getVideoTracks()[0]);

        if (allAudioTracks.length === 1) {
          finalStream.addTrack(allAudioTracks[0]);
        } else if (allAudioTracks.length > 1) {
          const audioCtx = new AudioContext();
          await audioCtx.resume();
          const dest = audioCtx.createMediaStreamDestination();
          allAudioTracks.forEach(t =>
            audioCtx.createMediaStreamSource(new MediaStream([t])).connect(dest)
          );
          finalStream.addTrack(dest.stream.getAudioTracks()[0]);
        }
      }

      const recorder = new MediaRecorder(finalStream, { mimeType: 'video/webm;codecs=vp8,opus' });
      recorder.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = handleRecordingStop;
      recorderRef.current = recorder;

      startRecordingDrawLoop();

      // Countdown — set first number and status together, then tick down
      setCountdownSync(5);
      setStatusSync('countdown');
      await new Promise(r => setTimeout(r, 1000));
      for (let i = 4; i >= 1; i--) {
        setCountdownSync(i);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdownSync(0);

      recorder.start(1000);
      setStatusSync('recording');

      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (recorderRef.current?.state !== 'inactive') recorderRef.current.stop();
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
      });
    } catch (err) {
      rVfcActiveRef.current = false;
      closeDocPiP();
      if (err.name !== 'NotAllowedError') setErrorMsg('No se pudo iniciar: ' + err.message);
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause();
      setStatusSync('paused');
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume();
      setStatusSync('recording');
    }
  };

  const stopRecording = () => {
    rVfcActiveRef.current = false;
    if (recorderRef.current?.state !== 'inactive') recorderRef.current.stop();
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
  };

  const handleRecordingStop = () => {
    rVfcActiveRef.current = false;
    closeDocPiP();
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    blobRef.current = blob;
    setPreviewUrl(URL.createObjectURL(blob));
    setStatusSync('preview');
  };

  const resetState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    blobRef.current = null;
    setStatusSync('idle');
    setDriveLink('');
    setUploadStatus('');
    setErrorMsg('');
    setElapsed(0);
    chunksRef.current = [];
  };

  // ── Drive upload ────────────────────────────────────────────────────────────
  const uploadToDrive = async () => {
    const blob = blobRef.current;
    if (!blob) return;

    setStatusSync('stopped');
    setUploadStatus('uploading');

    try {
      const fileName = `grabacion-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
      const form = new FormData();
      form.append('file', blob, fileName);
      form.append('fileName', fileName);

      const res = await fetch(`${BACKEND_URL}/loom/upload`, {
        method: 'POST',
        headers: { 'x-api-key': LOOM_API_KEY },
        body: form,
      });

      if (!res.ok) throw new Error(await res.text());
      const { link } = await res.json();

      setDriveLink(link);
      setUploadStatus('done');
    } catch (err) {
      setUploadStatus('error');
      setErrorMsg('Error al subir: ' + err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/loom-login');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(driveLink).then(() => {
      setCopyLabel('Copiado');
      setTimeout(() => setCopyLabel('Copiar link'), 2000);
    });
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = status === 'recording' || status === 'paused';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0d0d0d' }}>

      {/* Hidden camera video — always in DOM when camera is on so Chrome keeps decoding frames */}
      <video
        ref={cameraVideoRef}
        autoPlay muted playsInline disablePictureInPicture
        style={{ position: 'fixed', bottom: 0, left: '-2px', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />


      {/* Enlace a carpeta Drive */}
      <div className="flex justify-end px-8 pt-5">
        <a
          href="https://drive.google.com/drive/folders/1F8uq_gKYTw_6p2t8yXGOs1SGvg-3mHcP"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 87.3 78" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L28 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="M43.65 25L29.4 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5A9 9 0 000 53h28z" fill="#00ac47"/>
            <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59l6 14.1z" fill="#ea4335"/>
            <path d="M43.65 25L57.9 0H29.4z" fill="#00832d"/>
            <path d="M59 53H28L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.5c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
            <path d="M73.4 26.5c-.8-1.4-1.95-2.5-3.3-3.3L57.9 0H29.4l14.25 25H73.4z" fill="#ffba00"/>
          </svg>
          Ver grabaciones en Drive
        </a>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-8">


        {/* Idle */}
        {status === 'idle' && (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-white text-2xl font-semibold tracking-tight">Listo para grabar</h2>
            <button
              onClick={() => setCameraOn(v => !v)}
              className={`border rounded-full px-5 py-2 text-sm transition-colors ${cameraOn ? 'border-white text-white' : 'border-zinc-600 text-zinc-400 hover:border-zinc-400'}`}
            >
              {cameraOn ? 'Camara activada' : 'Activar camara'}
            </button>
            {cameraOn && (
              <p className="text-zinc-500 text-xs text-center max-w-xs">
                Arrastra la burbuja para fijar su posicion en la grabacion.
              </p>
            )}
            <button
              onClick={startRecording}
              className="bg-white text-black rounded-full px-8 py-3 text-sm font-medium hover:bg-zinc-100 transition-colors"
            >
              Iniciar grabacion
            </button>
          </div>
        )}

        {/* Countdown */}
        {status === 'countdown' && (
          <div className="flex flex-col items-center gap-4">
            <span className="text-zinc-400 text-sm tracking-widest uppercase">Grabando en</span>
            <span className="text-white font-mono" style={{ fontSize: 120, lineHeight: 1 }}>{countdown}</span>
            <p className="text-zinc-500 text-xs text-center">Visible en la ventana flotante</p>
          </div>
        )}

        {/* Recording / Paused */}
        {isActive && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              {status === 'recording'
                ? <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                : <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              }
              <span className="text-zinc-400 text-sm">{status === 'recording' ? 'Grabando' : 'En pausa'}</span>
            </div>
            <span className="text-white text-5xl font-mono tracking-widest">{formatTime(elapsed)}</span>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              {!cameraOn && (
                <button onClick={() => setCameraOn(true)} className="border border-zinc-600 text-zinc-400 rounded-full px-5 py-2 text-sm hover:border-zinc-400 transition-colors">
                  Activar camara
                </button>
              )}
              {!pipContainer && (
                <button onClick={openDocPiP} className="border border-zinc-600 text-zinc-400 rounded-full px-5 py-2 text-sm hover:border-zinc-400 transition-colors">
                  Flotar controles
                </button>
              )}
              {status === 'recording'
                ? <button onClick={pauseRecording} className="border border-zinc-600 text-zinc-300 rounded-full px-5 py-2 text-sm hover:border-zinc-400 transition-colors">Pausar</button>
                : <button onClick={resumeRecording} className="border border-zinc-600 text-zinc-300 rounded-full px-5 py-2 text-sm hover:border-zinc-400 transition-colors">Reanudar</button>
              }
              <button onClick={stopRecording} className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium hover:bg-zinc-100 transition-colors">Detener</button>
            </div>
          </div>
        )}

        {/* Preview */}
        {status === 'preview' && previewUrl && (
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <h2 className="text-white text-xl font-semibold tracking-tight">Revisa la grabacion</h2>
            <video src={previewUrl} controls className="w-full rounded-xl border border-zinc-800 bg-black" />
            <div className="flex gap-3">
              <button onClick={uploadToDrive} className="bg-white text-black rounded-full px-6 py-2.5 text-sm font-medium hover:bg-zinc-100 transition-colors">Subir a Drive</button>
              <button onClick={resetState} className="border border-zinc-600 text-zinc-300 rounded-full px-6 py-2.5 text-sm hover:border-zinc-400 transition-colors">Descartar</button>
            </div>
          </div>
        )}

        {/* Stopped / upload result */}
        {status === 'stopped' && (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold tracking-tight">Grabacion finalizada</h2>
            <p className="text-zinc-400 text-sm">{formatTime(elapsed)}</p>
            {uploadStatus === 'uploading' && (
              <div className="flex items-center gap-3 text-zinc-400 text-sm">
                <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                Subiendo a Google Drive...
              </div>
            )}
            {uploadStatus === 'done' && driveLink && (
              <div className="flex flex-col gap-4 w-full">
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-300 text-sm break-all">{driveLink}</div>
                <div className="flex gap-3">
                  <button onClick={handleCopyLink} className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium hover:bg-zinc-100 transition-colors">{copyLabel}</button>
                  <a href={driveLink} target="_blank" rel="noopener noreferrer" className="border border-zinc-600 text-zinc-300 rounded-full px-5 py-2 text-sm hover:border-zinc-400 transition-colors">Abrir en Drive</a>
                </div>
              </div>
            )}
            {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}
            <button onClick={resetState} className="border border-zinc-600 text-zinc-300 rounded-full px-5 py-2 text-sm hover:border-zinc-400 transition-colors mt-2">Nueva grabacion</button>
          </div>
        )}

        {status !== 'stopped' && status !== 'preview' && errorMsg && (
          <p className="text-red-400 text-sm text-center max-w-md">{errorMsg}</p>
        )}
      </main>

      {/* Idle camera bubble — only in idle for position setup, hidden during recording */}
      {cameraOn && status === 'idle' && (
        <div style={{ position: 'fixed', left: bubblePos.x, top: bubblePos.y, zIndex: 50, userSelect: 'none' }}>
          <div
            onMouseDown={onMouseDown}
            style={{ width: BUBBLE_SIZE, height: BUBBLE_SIZE, borderRadius: '50%', overflow: 'hidden', cursor: 'grab', border: '3px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 40px rgba(0,0,0,0.7)', background: '#111' }}
          >
            <video
              ref={bubbleVideoRef}
              autoPlay muted playsInline disablePictureInPicture
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', pointerEvents: 'none' }}
            />
          </div>
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Arrastra para posicionar</span>
          </div>
        </div>
      )}

      {/* Document PiP portal — renders into the floating window */}
      {pipContainer && createPortal(
        <PiPPanel
          status={status}
          elapsed={elapsed}
          countdown={countdown}
          cameraOn={cameraOn}
          getCameraStream={getCameraStream}
          onPause={pauseRecording}
          onResume={resumeRecording}
          onStop={stopRecording}
        />,
        pipContainer
      )}
    </div>
  );
}
