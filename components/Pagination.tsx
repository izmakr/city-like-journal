'use client';

export function Pagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (n: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-2 md:gap-3">
      <button
        className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border disabled:opacity-40"
        style={{ borderColor: "#1F2633" }}
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
      >
        ←
      </button>
      <span className="text-xs md:text-sm text-gray-400">{page} / {pageCount}</span>
      <button
        className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border disabled:opacity-40"
        style={{ borderColor: "#1F2633" }}
        disabled={page === pageCount}
        onClick={() => onPage(page + 1)}
      >
        →
      </button>
    </div>
  );
}


