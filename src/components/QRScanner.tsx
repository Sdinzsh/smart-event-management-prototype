import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, AlertCircle, QrCode } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setIsScanning(true);

    try {
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          html5Qrcode.stop().then(() => {
            if (isMountedRef.current) {
              setIsScanning(false);
              onScan(decodedText);
            }
          });
        },
        () => {
          // Ignore scan failures
        }
      );
    } catch (err) {
      if (isMountedRef.current) {
        setIsScanning(false);
        setError('Could not access camera. Please check permissions or enter code manually.');
      }
      console.error('QR Scanner error:', err);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" ref={containerRef}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="h-6 w-6" />
            <h2 className="text-lg font-semibold">QR Attendance Scanner</h2>
          </div>
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Camera Scanner */}
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
              <div id="qr-reader" className="w-full h-full"></div>
              
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="h-16 w-16 text-gray-300 mb-4" />
                  <button
                    onClick={startScanning}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Start Camera
                  </button>
                </div>
              )}
              
              {isScanning && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <button
                    onClick={stopScanning}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                  >
                    Stop Scanning
                  </button>
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="text-center text-gray-500 text-sm">or</div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter QR code manually..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Verify Code
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
