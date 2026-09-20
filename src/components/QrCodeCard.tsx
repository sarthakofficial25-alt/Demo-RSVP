import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Loader2 } from 'lucide-react';

interface QrCodeCardProps {
  value: string;
  size?: number;
  label?: string;
  className?: string;
  showBorder?: boolean;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  value,
  size = 130,
  label = 'Scan for Registration ID',
  className = '',
  showBorder = true,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!value) return;

    QRCode.toDataURL(value, {
      width: Math.max(size * 2, 260), // High DPI crispness
      margin: 1,
      color: {
        dark: '#1e293b', // slate-800
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
        if (isMounted) {
          setError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-3 bg-white rounded-xl ${
        showBorder ? 'border border-gray-200 shadow-xs' : ''
      } ${className}`}
    >
      <div
        className="relative flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code for Registration ID ${value}`}
            className="w-full h-full object-contain select-none"
          />
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-2 text-center text-gray-400">
            <QrIcon className="w-8 h-8 stroke-1 text-gray-300 mb-1" />
            <span className="text-[10px] text-gray-500 font-mono">{value}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {label && (
        <div className="mt-2 text-center">
          <span className="text-[10px] font-medium tracking-tight text-gray-500 uppercase flex items-center justify-center gap-1">
            <QrIcon className="w-3 h-3 text-blue-600 shrink-0" />
            {label}
          </span>
          <span className="font-mono text-[11px] font-bold text-gray-800 block mt-0.5 select-all">
            {value}
          </span>
        </div>
      )}
    </div>
  );
};
