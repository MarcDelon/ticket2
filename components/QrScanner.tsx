"use client";

import { useState, useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QrScannerProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
}

export default function QrScannerComponent({ onResult, onError }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initScanner = async () => {
      try {
        if (videoRef.current && isMounted) {
          // Créer une instance de QrScanner
          scannerRef.current = new QrScanner(videoRef.current, (result) => {
            onResult(result.data);
          }, {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 10,
          });

          // Démarrer le scanner
          await scannerRef.current.start();
          if (isMounted) {
            setIsCameraReady(true);
            setCameraError(false);
          }
        }
      } catch (err) {
        console.error('Error initializing QR scanner:', err);
        if (isMounted) {
          setCameraError(true);
          onError('Failed to initialize camera. Please ensure you have granted camera permissions.');
        }
      }
    };

    // Initialiser le scanner
    initScanner();

    // Vérifier périodiquement si la caméra est prête
    const checkCameraInterval = setInterval(() => {
      if (videoRef.current && videoRef.current.srcObject && isMounted && !isCameraReady) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream.active) {
          setIsCameraReady(true);
          setCameraError(false);
        }
      }
    }, 500);

    return () => {
      isMounted = false;
      clearInterval(checkCameraInterval);
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [onResult, onError]);

  return (
    <div className="relative w-full h-full">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className="w-full h-full object-cover"
      />
      
      {(!isCameraReady || cameraError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900/80 to-teal-900/80 backdrop-blur-sm text-white p-4">
          <Loader className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
          <p className="text-base font-semibold text-center mb-2">Autorisez l'accès à la caméra</p>
          <p className="text-xs text-emerald-200 text-center">Démarrage de la caméra...</p>
        </div>
      )}
    </div>
  );
}