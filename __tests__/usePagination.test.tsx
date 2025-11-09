import { renderHook, act, waitFor } from '@testing-library/react';
import { usePagination } from '@/lib/hooks/usePagination';

const mockPush = jest.fn();
const mockReplace = jest.fn();

let currentSearchParams: URLSearchParams;

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: (key: string) => currentSearchParams.get(key),
    toString: () => currentSearchParams.toString(),
  })),
  usePathname: jest.fn(() => '/posts'),
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
  })),
}));

describe('usePagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentSearchParams = new URLSearchParams();
  });

  it('clamps page value and triggers replace when query exceeds pageCount', async () => {
    currentSearchParams = new URLSearchParams('page=10');
    const items = Array.from({ length: 12 }, (_, index) => index + 1);

    renderHook(() => usePagination({ items, pageSize: 5 }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/posts?page=3', { scroll: false });
    });
  });

  it('returns correct page metadata for valid query', () => {
    currentSearchParams = new URLSearchParams('page=2');
    const items = Array.from({ length: 20 }, (_, index) => index + 1);

    const { result } = renderHook(() => usePagination({ items, pageSize: 6 }));

    expect(result.current.page).toBe(2);
    expect(result.current.pageCount).toBe(4);
    expect(result.current.pageItems).toEqual([7, 8, 9, 10, 11, 12]);
    expect(result.current.startIndex).toBe(7);
    expect(result.current.endIndex).toBe(12);
  });

  it('goToPage pushes updated query string', () => {
    currentSearchParams = new URLSearchParams();
    const items = Array.from({ length: 15 }, (_, index) => index + 1);

    const { result } = renderHook(() => usePagination({ items, pageSize: 5 }));

    act(() => {
      result.current.goToPage(3);
    });

    expect(mockPush).toHaveBeenCalledWith('/posts?page=3', { scroll: false });
  });
});
