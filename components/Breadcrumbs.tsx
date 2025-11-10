import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="パンくずリスト" className="text-sm text-[#9AA7B2]">
      <ol className="flex flex-wrap gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-[#E6EAF2] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-[#E6EAF2]' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-[#4A5568]">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


