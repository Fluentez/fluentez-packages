import { RefObject, useLayoutEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';

export interface UseScrollRestorationResult<T extends HTMLElement = HTMLDivElement> {
  containerRef: RefObject<T | null>;
  handleScroll: () => void;
}

/**
 * Custom React Hook for restoring scroll positions on overflow HTML elements across client route changes.
 * Restores previous position on POP (history back/forward) and resets position to top on PUSH navigation.
 *
 * @template T HTML element type extending HTMLElement
 * @param key Unique key for persisting scroll position state in sessionStorage
 * @param isReady Flag indicating content render completion status
 * @returns Object containing element containerRef and handleScroll listener handler
 */
export function useScrollRestoration<T extends HTMLElement = HTMLDivElement>(
  key: string,
  isReady: boolean = true
): UseScrollRestorationResult<T> {
  const containerRef = useRef<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationType = useNavigationType();

  const handleScroll = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      if (containerRef.current) {
        sessionStorage.setItem(key, containerRef.current.scrollTop.toString());
      }
    }, 100);
  };

  useLayoutEffect(() => {
    if (!isReady || !containerRef.current) return;

    if (navigationType === 'PUSH') {
      containerRef.current.scrollTop = 0;
      sessionStorage.removeItem(key);
      return;
    }

    if (navigationType === 'POP') {
      const savedPos = sessionStorage.getItem(key);
      if (savedPos !== null) {
        containerRef.current.scrollTop = parseInt(savedPos, 10);
      }
    }
  }, [isReady, key, navigationType]);

  return { containerRef, handleScroll };
}
