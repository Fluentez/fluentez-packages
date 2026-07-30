import {
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

export interface UseInfiniteScrollTopResult<T> {
    data: T[];
    setData: Dispatch<SetStateAction<T[]>>;
}

/**
 * Custom React hook for handling top-loading infinite scroll containers.
 * Maintains scroll offset position when prepending dynamic historic datasets.
 *
 * @template T Entity item type containing unique identifying key `_id` or `id`
 * @param containerRef Reference to the HTML scroll container element
 * @param totalPages Total available pagination pages
 * @param page Current active page index
 * @param setPage Dispatch function to increment page index
 * @param newData Array of newly fetched data items
 * @param shouldReverse Optional boolean flag to reverse prepended data items
 * @returns Object containing data array and setData state dispatcher
 */
export function useInfiniteScrollTop<T extends { _id?: string | number; id?: string | number }>(
    containerRef: RefObject<HTMLElement | null>,
    totalPages: number,
    page: number,
    setPage: Dispatch<SetStateAction<number>>,
    newData: T[],
    shouldReverse: boolean = false
): UseInfiniteScrollTopResult<T> {
    const [data, setData] = useState<T[]>([]);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleScroll = useCallback(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            if (!containerRef.current) return;

            const { scrollTop } = containerRef.current;
            const scrolledToTop = scrollTop <= 5;

            if (scrolledToTop) {
                if (!totalPages || page >= totalPages) return;
                setPage((oldPage) => oldPage + 1);
            }
        }, 200);
    }, [containerRef, totalPages, page, setPage]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [containerRef, handleScroll]);

    useEffect(() => {
        let prevScrollHeight = 0;
        let prevScrollTop = 0;

        if (containerRef.current) {
            prevScrollHeight = containerRef.current.scrollHeight;
            prevScrollTop = containerRef.current.scrollTop;
        }

        if (newData && newData.length > 0) {
            setData((oldData) => {
                const getItemId = (item: T): string | number => {
                    if (item._id !== undefined) return item._id;
                    if (item.id !== undefined) return item.id;
                    return JSON.stringify(item);
                };

                const seen = new Set(oldData.map(getItemId));
                const newItems = newData.filter((item) => !seen.has(getItemId(item)));

                if (shouldReverse) {
                    const newDataArray = Array.isArray(newItems) ? [...newItems] : [newItems];
                    return [...newDataArray.reverse(), ...oldData];
                } else {
                    return [...newItems, ...oldData];
                }
            });
        }

        requestAnimationFrame(() => {
            if (containerRef.current) {
                const newScrollTop =
                    prevScrollTop + containerRef.current.scrollHeight - prevScrollHeight;
                containerRef.current.scrollTop = newScrollTop;
            }
        });
    }, [containerRef, newData, shouldReverse]);

    return { data, setData };
}
