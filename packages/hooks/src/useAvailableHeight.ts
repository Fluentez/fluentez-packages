import { useLayoutEffect, useRef, useState, RefObject } from 'react';

export interface UseAvailableHeightResult<T extends HTMLElement = HTMLDivElement> {
    ref: RefObject<T | null>;
    height: string;
}

/**
 * Custom React Hook for calculating available vertical height of a container element
 * dynamically based on parent container height minus previous sibling height.
 *
 * @template T HTML element type extending HTMLElement
 * @param fallbackHeight Initial height before DOM layout calculation (Default: '100%')
 * @returns Object containing container element ref and computed height CSS string
 */
export function useAvailableHeight<T extends HTMLElement = HTMLDivElement>(
    fallbackHeight: string = '100%'
): UseAvailableHeightResult<T> {
    const ref = useRef<T | null>(null);
    const [height, setHeight] = useState<string>(fallbackHeight);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element || !element.parentElement) return;

        const parent = element.parentElement;
        const sibling = element.previousElementSibling as HTMLElement | null;

        const calculate = () => {
            const parentH = parent.clientHeight;
            const siblingH = sibling ? sibling.offsetHeight : 0;
            const available = parentH - siblingH;

            if (available > 0) {
                setHeight(`${available}px`);
            }
        };

        calculate();

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(calculate);
        });

        observer.observe(parent);
        if (sibling) {
            observer.observe(sibling);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return { ref, height };
}

export default useAvailableHeight;
