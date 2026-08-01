export type AnimationType = 'shimmer' | 'pulse' | 'wave' | 'none';

export type ThemeMode =
  | 'auto'
  | 'light'
  | 'dark'
  | {
      background?: string;
      skeleton?: string;
      highlight?: string;
    };

export interface SkeletonOptions {
  /**
   * Animation effect applied to skeleton blocks.
   * @default 'shimmer'
   */
  animation?: AnimationType;

  /**
   * Color theme mode or custom palette.
   * @default 'auto'
   */
  theme?: ThemeMode;

  /**
   * Custom border radius applied to skeleton items.
   * When set to 'auto', reads border-radius directly from original computed styles.
   * @default 'auto'
   */
  borderRadius?: string | number | 'auto';

  /**
   * Selector string or predicate function matching elements to ignore completely.
   * Ignored elements won't be replaced or converted to skeleton blocks.
   */
  exclude?: string | ((el: HTMLElement) => boolean);

  /**
   * Selector string or predicate function matching elements to keep unchanged.
   * Intact elements remain visible inside the skeleton overlay (e.g. icons, layout frames).
   */
  keep?: string | ((el: HTMLElement) => boolean);

  /**
   * Duration in milliseconds for fading out skeleton when restoring UI.
   * @default 250
   */
  fadeDuration?: number;

  /**
   * Custom CSS class added to the top-level skeleton container.
   */
  className?: string;

  /**
   * Ignore elements with display: none or visibility: hidden.
   * @default true
   */
  ignoreHidden?: boolean;
}

export interface SkeletonController {
  /**
   * Restores the original target element UI and cleans up skeleton DOM.
   */
  restore: () => void;

  /**
   * The generated overlay container element.
   */
  skeletonElement: HTMLElement;

  /**
   * The target container element.
   */
  targetElement: HTMLElement;

  /**
   * Whether the skeleton controller has already been restored/destroyed.
   */
  readonly isDestroyed: boolean;
}
