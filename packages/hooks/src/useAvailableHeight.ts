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

        const calculate = () => {
            const currentElement = ref.current;
            if (!currentElement || !currentElement.parentElement) return;

            const currentParent = currentElement.parentElement;
            const sibling = currentElement.previousElementSibling as HTMLElement | null;

            const parentH = currentParent.clientHeight;
            const siblingH = sibling ? sibling.offsetHeight : 0;
            const available = parentH - siblingH;

            if (available > 0) {
                setHeight(`${available}px`);
            }
        };

        // 1. Initial synchronous layout calculation before paint
        calculate();

        // 2. Schedule rAF to catch post-reload DOM layout/font render shifts
        const rafId = requestAnimationFrame(calculate);

        // 3. Observe element, parent, and sibling with ResizeObserver
        const observer = new ResizeObserver(() => {
            requestAnimationFrame(calculate);
        });

        observer.observe(element);
        observer.observe(parent);

        const sibling = element.previousElementSibling as HTMLElement | null;
        if (sibling) {
            observer.observe(sibling);
        }

        // 4. Attach window resize listener
        window.addEventListener('resize', calculate);

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
            window.removeEventListener('resize', calculate);
        };
    }, []);

    return { ref, height };
}

export default useAvailableHeight;
