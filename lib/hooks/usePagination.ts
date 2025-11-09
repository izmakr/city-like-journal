'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type UsePaginationOptions<T> = {
  items: readonly T[];
  pageSize: number;
  paramKey?: string;
};

type UsePaginationResult<T> = {
  page: number;
  pageCount: number;
  pageItems: readonly T[];
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
};

const DEFAULT_PARAM_KEY = 'page';

export function usePagination<T>({ items, pageSize, paramKey = DEFAULT_PARAM_KEY }: UsePaginationOptions<T>): UsePaginationResult<T> {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParamsString = searchParams.toString();

  const totalItems = items.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  const rawPageValue = Number(searchParams.get(paramKey) ?? '1');
  const normalized = Number.isFinite(rawPageValue) && rawPageValue >= 1 ? Math.floor(rawPageValue) : 1;
  const page = Math.min(Math.max(normalized, 1), pageCount);
  const hasParam = searchParams.get(paramKey) !== null;

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = totalItems === 0 ? 0 : Math.min(page * pageSize, totalItems);

  const buildUrl = useCallback(
    (targetPage: number) => {
      const nextParams = new URLSearchParams(searchParamsString);
      if (targetPage <= 1) {
        nextParams.delete(paramKey);
      } else {
        nextParams.set(paramKey, String(targetPage));
      }
      const queryString = nextParams.toString();
      return `${pathname}${queryString ? `?${queryString}` : ''}`;
    },
    [paramKey, pathname, searchParamsString],
  );

  useEffect(() => {
    if (normalized !== page || (page === 1 && hasParam)) {
      const url = buildUrl(page);
      router.replace(url, { scroll: false });
    }
  }, [buildUrl, normalized, page, hasParam, router]);

  const goToPage = useCallback(
    (target: number) => {
      const clamped = Math.min(Math.max(target, 1), pageCount);
      if (clamped === page) return;
      const url = buildUrl(clamped);
      router.push(url, { scroll: false });
    },
    [buildUrl, page, pageCount, router],
  );

  return {
    page,
    pageCount,
    pageItems,
    startIndex,
    endIndex,
    goToPage,
  };
}
