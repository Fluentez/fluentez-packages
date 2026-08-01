import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { createSkeleton } from './skeleton';
import { SkeletonController, SkeletonOptions } from './types';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * React Hook for creating skeleton screens matching container UI.
 *
 * @param loading Controls skeleton display state
 * @param options Configuration options
 * @returns React ref callback to bind to container element
 */
export function useSkeleton<T extends HTMLElement = HTMLDivElement>(
  loading: boolean,
  options: SkeletonOptions = {}
): React.RefObject<T> {
  const containerRef = useRef<T>(null);
  const controllerRef = useRef<SkeletonController | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (loading) {
      controllerRef.current = createSkeleton(el, options);
    } else if (controllerRef.current) {
      controllerRef.current.restore();
      controllerRef.current = null;
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.restore();
        controllerRef.current = null;
      }
    };
  }, [loading, JSON.stringify(options)]);

  return containerRef;
}

export interface SkeletonContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show skeleton loader
   */
  loading: boolean;

  /**
   * Skeleton configuration options
   */
  options?: SkeletonOptions;

  /**
   * Content children to show/skeletonize
   */
  children: React.ReactNode;
}

/**
 * Skeleton Container wrapper component.
 * Automatically skeletonizes its children when `loading` is true.
 */
export const SkeletonContainer: React.FC<SkeletonContainerProps> = ({
  loading,
  options = {},
  children,
  className = '',
  style,
  ...props
}) => {
  const containerRef = useSkeleton<HTMLDivElement>(loading, options);

  return (
    <div ref={containerRef} className={className} style={style} {...props}>
      {children}
    </div>
  );
};
