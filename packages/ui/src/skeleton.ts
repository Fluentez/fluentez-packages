import { SkeletonController, SkeletonOptions } from './types';
import { injectSkeletonStyles } from './styles';

const ACTIVE_SKELETON_MAP = new WeakMap<HTMLElement, SkeletonController>();

/**
 * Checks whether an element is visible in the layout.
 */
function isElementVisible(el: HTMLElement): boolean {
  if (!el.isConnected) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Checks if an element is a leaf container or content node (text, image, input, icon).
 */
function isContentElement(el: HTMLElement): boolean {
  const tagName = el.tagName.toLowerCase();

  // Media & Input elements
  if (['img', 'svg', 'canvas', 'video', 'input', 'textarea', 'select', 'button', 'iframe'].includes(tagName)) {
    return true;
  }

  // Elements with background image or styled avatar/badge
  const style = window.getComputedStyle(el);
  if (style.backgroundImage !== 'none' || (style.borderRadius !== '0px' && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent')) {
    if (el.children.length === 0) return true;
  }

  // Leaf elements with direct text nodes
  let hasText = false;
  for (let i = 0; i < el.childNodes.length; i++) {
    const node = el.childNodes[i];
    if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0) {
      hasText = true;
      break;
    }
  }

  if (hasText) return true;

  // Empty element with explicit dimensions
  if (el.children.length === 0) return true;

  return false;
}

/**
 * Traverses element tree and extracts all target content elements for skeleton blocks.
 */
function collectSkeletonTargets(
  root: HTMLElement,
  options: SkeletonOptions
): HTMLElement[] {
  const targets: HTMLElement[] = [];

  const matchesExclude = (el: HTMLElement): boolean => {
    if (el.hasAttribute('data-skeleton-ignore')) return true;
    if (typeof options.exclude === 'string') {
      return el.matches(options.exclude);
    }
    if (typeof options.exclude === 'function') {
      return options.exclude(el);
    }
    return false;
  };

  const matchesKeep = (el: HTMLElement): boolean => {
    if (el.hasAttribute('data-skeleton-keep')) return true;
    if (typeof options.keep === 'string') {
      return el.matches(options.keep);
    }
    if (typeof options.keep === 'function') {
      return options.keep(el);
    }
    return false;
  };

  function traverse(el: HTMLElement) {
    if (options.ignoreHidden !== false && !isElementVisible(el)) {
      return;
    }

    if (matchesExclude(el)) {
      return;
    }

    if (matchesKeep(el)) {
      return;
    }

    if (isContentElement(el)) {
      targets.push(el);
    } else {
      const children = Array.from(el.children) as HTMLElement[];
      for (const child of children) {
        traverse(child);
      }
    }
  }

  const rootChildren = Array.from(root.children) as HTMLElement[];
  for (const child of rootChildren) {
    traverse(child);
  }

  return targets;
}

/**
 * Creates a matching UI skeleton overlay from an existing HTML element.
 *
 * @param target Target HTMLElement or selector string
 * @param options Skeleton generation options
 * @returns SkeletonController with restore() method
 */
export function createSkeleton(
  target: HTMLElement | string,
  options: SkeletonOptions = {}
): SkeletonController {
  const dummyController: SkeletonController = {
    restore: () => {},
    skeletonElement: typeof document !== 'undefined' ? document.createElement('div') : ({} as HTMLElement),
    targetElement: typeof document !== 'undefined' ? document.createElement('div') : ({} as HTMLElement),
    isDestroyed: true,
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return dummyController;
  }

  const targetElement = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;

  if (!targetElement) {
    console.warn('[fluentez-ui] Target element not found:', target);
    return dummyController;
  }

  // Restore any existing active skeleton on this element first
  if (ACTIVE_SKELETON_MAP.has(targetElement)) {
    ACTIVE_SKELETON_MAP.get(targetElement)?.restore();
  }

  injectSkeletonStyles();

  const containerRect = targetElement.getBoundingClientRect();
  const animation = options.animation || 'shimmer';
  const fadeDuration = options.fadeDuration ?? 250;

  // Save original target position style to preserve layout positioning
  const originalPosition = targetElement.style.position;
  const computedPosition = window.getComputedStyle(targetElement).position;
  if (computedPosition === 'static') {
    targetElement.style.position = 'relative';
  }

  const overlay = document.createElement('div');
  overlay.className = `fluentez-skeleton-overlay ${options.className || ''}`.trim();

  if (typeof options.theme === 'string') {
    if (options.theme !== 'auto') {
      overlay.setAttribute('data-theme', options.theme);
    }
  } else if (typeof options.theme === 'object' && options.theme !== null) {
    const baseBg = options.theme.skeleton || options.theme.background;
    if (baseBg) {
      overlay.style.setProperty('--fluentez-skel-bg', baseBg);
    }
    if (options.theme.highlight) {
      overlay.style.setProperty('--fluentez-skel-highlight', options.theme.highlight);
    }
  }

  const targets = collectSkeletonTargets(targetElement, options);
  const hiddenElements: { el: HTMLElement; originalVisibility: string }[] = [];

  for (const item of targets) {
    const itemRect = item.getBoundingClientRect();
    const computed = window.getComputedStyle(item);

    const top = itemRect.top - containerRect.top;
    const left = itemRect.left - containerRect.left;

    const block = document.createElement('div');
    block.className = `fluentez-skeleton-block fluentez-skeleton-anim-${animation}`;

    block.style.top = `${top}px`;
    block.style.left = `${left}px`;
    block.style.width = `${itemRect.width}px`;
    block.style.height = `${itemRect.height}px`;

    // Border radius resolution
    if (options.borderRadius === 'auto' || options.borderRadius === undefined) {
      block.style.borderRadius = computed.borderRadius;
    } else if (typeof options.borderRadius === 'number') {
      block.style.borderRadius = `${options.borderRadius}px`;
    } else {
      block.style.borderRadius = String(options.borderRadius);
    }

    overlay.appendChild(block);

    // Hide original content element visually while preserving space
    hiddenElements.push({
      el: item,
      originalVisibility: item.style.visibility,
    });
    item.style.visibility = 'hidden';
  }

  targetElement.appendChild(overlay);

  let destroyed = false;

  const controller: SkeletonController = {
    get isDestroyed() {
      return destroyed;
    },
    skeletonElement: overlay,
    targetElement,
    restore: () => {
      if (destroyed) return;
      destroyed = true;

      // Restore original visibility of content elements
      for (const { el, originalVisibility } of hiddenElements) {
        el.style.visibility = originalVisibility;
      }

      // Fade out overlay
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        // Restore position only after overlay fade-out completes to avoid top layout jumps
        if (computedPosition === 'static') {
          targetElement.style.position = originalPosition;
        }
      }, fadeDuration);

      ACTIVE_SKELETON_MAP.delete(targetElement);
    },
  };

  ACTIVE_SKELETON_MAP.set(targetElement, controller);
  return controller;
}

/**
 * Alias for createSkeleton
 */
export const skeletonize = createSkeleton;
