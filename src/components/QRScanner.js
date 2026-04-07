'use client';
import { useEffect, useRef, useState } from 'react';

export default function QRScanner({ onScanSuccess, onScanError }) {
  const scannerRef   = useRef(null);
  const instanceRef  = useRef(null);
  const [status, setStatus]     = useState('idle');   // idle | requesting | scanning | error
  const [errMsg, setErrMsg]     = useState('');
  const [manualToken, setManualToken] = useState('');
  const [showManual, setShowManual]   = useState(false);

  const startScanner = async () => {
    setStatus('requesting');
    try {
      // Dynamically import so Next.js SSR never touches it
      const { Html5Qrcode } = await import('html5-qrcode');

      // Ask explicitly for camera permission first
      await navigator.mediaDevices.getUserMedia({ video: true });

      setStatus('scanning');

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      instanceRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          html5QrCode.stop().catch(() => {});
          onScanSuccess(decodedText, null, () => {
            // Resume if needed
            setStatus('idle');
          });
        },
        () => { /* continuous scan errors - ignore */ }
      );
    } catch (err) {
      console.error('[QR SCANNER]', err);
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera permission was denied. Please allow camera access in your browser settings, then try again.'
        : err?.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : `Camera error: ${err?.message || 'Unknown error'}`;
      setErrMsg(msg);
      setStatus('error');
    }
  };

  const stopScanner = () => {
    if (instanceRef.current) {
      instanceRef.current.stop().catch(() => {});
      instanceRef.current = null;
    }
    setStatus('idle');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        instanceRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const token = manualToken.trim();
    if (!token) return;
    onScanSuccess(token, null, () => { setManualToken(''); });
    setManualToken('');
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ─── Camera Viewfinder Area ─── */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#0f172a',
        minHeight: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>

        {/* Animated scanning frame overlay */}
        {status === 'scanning' && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 240, height: 240, position: 'relative',
            }}>
              {/* Corner brackets */}
              {[['top:0;left:0', 'top', 'left'], ['top:0;right:0', 'top', 'right'],
                ['bottom:0;left:0', 'bottom', 'left'], ['bottom:0;right:0', 'bottom', 'right']].map(([pos, v, h], i) => (
                <div key={i} style={{
                  position: 'absolute',
                  [v]: 0, [h]: 0,
                  width: 36, height: 36,
                  borderTop: v === 'top' ? '3px solid #00fff5' : 'none',
                  borderBottom: v === 'bottom' ? '3px solid #00fff5' : 'none',
                  borderLeft: h === 'left' ? '3px solid #00fff5' : 'none',
                  borderRight: h === 'right' ? '3px solid #00fff5' : 'none',
                  borderRadius: h === 'left' && v === 'top' ? '6px 0 0 0'
                    : h === 'right' && v === 'top' ? '0 6px 0 0'
                    : h === 'left' && v === 'bottom' ? '0 0 0 6px'
                    : '0 0 6px 0',
                }} />
              ))}
              {/* Scanning sweep line */}
              <div style={{
                position: 'absolute', left: 4, right: 4, height: 2,
                background: 'linear-gradient(to right, transparent, #00fff5, transparent)',
                animation: 'sweep 2s ease-in-out infinite',
                top: '50%',
              }} />
            </div>
          </div>
        )}

        <style>{`
          @keyframes sweep {
            0%   { top: 10%; }
            50%  { top: 85%; }
            100% { top: 10%; }
          }
        `}</style>

        {/* The actual video container rendered by html5-qrcode */}
        <div
          id="qr-reader-container"
          style={{
            width: '100%',
            display: status === 'scanning' ? 'block' : 'none',
          }}
        />

        {/* Idle State */}
        {status === 'idle' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
            <div style={{ fontSize: 56, marginBottom: '1rem' }}>📷</div>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Click below to activate the camera scanner
            </p>
            <button onClick={startScanner} style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 700,
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}>
              🎥 Open Camera
            </button>
          </div>
        )}

        {/* Requesting Permission */}
        {status === 'requesting' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
            <div style={{ fontSize: 40, marginBottom: '1rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Requesting camera permission...</p>
          </div>
        )}

        {/* Scanning active - show stop button */}
        {status === 'scanning' && (
          <div style={{ position: 'absolute', bottom: 12, zIndex: 20 }}>
            <button onClick={stopScanner} style={{
              background: 'rgba(239,68,68,0.85)', color: 'white', border: 'none',
              borderRadius: 20, padding: '0.5rem 1.2rem', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', backdropFilter: 'blur(4px)',
            }}>
              ✕ Stop Camera
            </button>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'white', maxWidth: 360 }}>
            <div style={{ fontSize: 40, marginBottom: '1rem' }}>🚫</div>
            <p style={{ color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {errMsg}
            </p>
            <button onClick={startScanner} style={{
              background: '#2563eb', color: 'white', border: 'none',
              borderRadius: 10, padding: '0.7rem 1.5rem', fontWeight: 600,
              cursor: 'pointer', marginRight: '0.5rem',
            }}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* ─── Manual Token Entry Fallback ─── */}
      <div style={{ marginTop: '1.5rem' }}>
        <button
          onClick={() => setShowManual(s => !s)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748b', fontSize: '0.85rem', textDecoration: 'underline',
            display: 'block', marginBottom: '0.75rem',
          }}
        >
          {showManual ? '▲ Hide manual entry' : '▾ No camera? Enter token manually'}
        </button>

        {showManual && (
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Paste the QR token UUID here..."
              value={manualToken}
              onChange={e => setManualToken(e.target.value)}
              style={{
                flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 10,
                padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem',
                color: '#0f172a', background: '#f8faff',
              }}
            />
            <button type="submit" style={{
              background: '#2563eb', color: 'white', border: 'none',
              borderRadius: 10, padding: '0.75rem 1.2rem', fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Verify
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
