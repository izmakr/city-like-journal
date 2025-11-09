interface ChipProps {
  children: React.ReactNode;
  variant?: 'area' | 'kind';
}

export function Chip({ children, variant = 'kind' }: ChipProps) {
  const styles =
    variant === 'area'
      ? {
          borderColor: '#2A4A6B',
          background: 'rgba(42, 74, 107, 0.2)',
          color: '#7DB3D3',
        }
      : {
          borderColor: '#1F2633',
          background: '#0f1420',
          color: '#E6EAF2',
        };

  return (
    <span
      className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-md font-medium border"
      style={styles}
    >
      {children}
    </span>
  );
}


