import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, Copy, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { Registration, Event } from '../types';

interface QRCodeDisplayProps {
  registration: Registration;
  event: Event;
}

export function QRCodeDisplay({ registration, event }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(registration.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 500;
      
      if (ctx) {
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code centered
        ctx.drawImage(img, 50, 50, 300, 300);
        
        // Add event title
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(event.title.substring(0, 30), canvas.width / 2, 390);
        
        // Add registration info
        ctx.font = '14px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(registration.userName, canvas.width / 2, 420);
        ctx.fillText(new Date(event.date).toLocaleDateString(), canvas.width / 2, 445);
        
        // Download
        const link = document.createElement('a');
        link.download = `qr-${event.title.replace(/[^a-z0-9]/gi, '_')}-${registration.userName.replace(/[^a-z0-9]/gi, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    
    // Use encodeURIComponent for better browser compatibility
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Your Attendance QR Code</h3>
      </div>

      <div className="flex flex-col items-center">
        <div 
          ref={qrRef}
          className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-4"
        >
          <QRCodeSVG
            value={registration.qrCode}
            size={200}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#1f2937"
          />
        </div>

        <p className="text-sm text-gray-500 text-center mb-4">
          Show this QR code at the event for attendance tracking
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={downloadQRCode}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t w-full">
          <p className="text-xs text-gray-400 text-center">
            Code: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{registration.qrCode}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
