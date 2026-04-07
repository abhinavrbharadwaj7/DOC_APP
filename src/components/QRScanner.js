'use client';
import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanError }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only initialize once on the client
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      const handleSuccess = (decodedText, decodedResult) => {
        scanner.pause(true); // Pause scanning on success to prevent multiple API calls
        onScanSuccess(decodedText, decodedResult, () => scanner.resume());
      };

      scanner.render(handleSuccess, onScanError);
      scannerRef.current = scanner;
    }

    return () => {
      // Cleanup
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [onScanSuccess, onScanError]);

  return <div id="qr-reader" style={{ width: "100%", maxWidth: "500px", margin: "0 auto", backgroundColor: "white", borderRadius: "10px", overflow: "hidden" }}></div>;
}
