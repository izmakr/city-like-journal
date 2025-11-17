'use client';

import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmButtonColor = variant === 'danger' ? '#EF4444' : '#60A5FA';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity duration-200"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100
        }}
        onClick={onCancel}
      />

      {/* Dialog Container */}
      <div className="fixed inset-0 flex items-start justify-center px-4 pt-32 sm:pt-40 pointer-events-none" style={{ zIndex: 101 }}>
        {/* Dialog */}
        <div
          className="relative max-w-md w-full rounded-xl border shadow-2xl p-6 animate-scale-in pointer-events-auto"
        style={{
          background: '#0B0E13',
          borderColor: '#1F2633',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h3
          className="text-xl font-semibold mb-3"
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            color: '#E6EAF2',
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm mb-6" style={{ color: '#9AA7B2', lineHeight: '1.6' }}>
          {message}
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border font-medium text-sm transition-all hover:bg-[#131823]"
            style={{
              borderColor: '#1F2633',
              color: '#9AA7B2',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90"
            style={{
              backgroundColor: confirmButtonColor,
              color: '#FFFFFF',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.15s ease-out;
        }
      `}</style>
      </div>
    </>
  );
}

