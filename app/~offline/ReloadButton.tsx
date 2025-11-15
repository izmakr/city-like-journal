'use client';

export function ReloadButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="mt-6 rounded-lg px-6 py-3 font-medium transition-colors"
      style={{
        backgroundColor: '#1F2937',
        color: '#E6EAF2',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#374151';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1F2937';
      }}
    >
      再読み込み
    </button>
  );
}

