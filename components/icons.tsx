import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const createIcon = (paths: ReactNode) => {
  const Icon = ({ width = 24, height = 24, ...rest }: IconProps) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths}
    </svg>
  );
  Icon.displayName = 'Icon';
  return Icon;
};

export const CalendarIcon = createIcon(
  <>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </>,
);

export const MenuIcon = createIcon(
  <>
    <path d="M4 5h16" />
    <path d="M4 12h16" />
    <path d="M4 19h16" />
  </>,
);

export const SearchIcon = createIcon(
  <>
    <path d="m21 21-4.34-4.34" />
    <circle cx="11" cy="11" r="8" />
  </>,
);

export const CloseIcon = createIcon(
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
);

export const ChevronDownIcon = createIcon(<path d="m6 9 6 6 6-6" />);

export const BookmarkIcon = createIcon(
  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
);

// フィル版のブックマークアイコン（塗りつぶし）
const createFilledIcon = (paths: ReactNode) => {
  const Icon = ({ width = 24, height = 24, ...rest }: IconProps) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths}
    </svg>
  );
  Icon.displayName = 'FilledIcon';
  return Icon;
};

export const BookmarkFilledIcon = createFilledIcon(
  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
);


