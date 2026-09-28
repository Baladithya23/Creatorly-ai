'use client';
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const borderColor = type === 'error' ? 'border-rose-800/80 bg-rose-950/90 text-rose-200' : 'border-teal-800/80 bg-zinc-900/95 text-zinc-100';

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-sm animate-fade-in ${borderColor}`}>
      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-zinc-400 hover:text-zinc-200 text-xs">
        ✕
      </button>
    </div>
  );
}
