const STYLE_ID = 'fluentez-ui-skeleton-styles';

export function injectSkeletonStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = `
    .fluentez-skeleton-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      box-sizing: border-box;
      overflow: hidden;
      transition: opacity 250ms ease-in-out;
    }

    .fluentez-skeleton-block {
      position: absolute;
      box-sizing: border-box;
      background-color: var(--fluentez-skel-bg, #cbd5e1);
      overflow: hidden;
    }

    /* Dark mode auto-detection fallback */
    @media (prefers-color-scheme: dark) {
      .fluentez-skeleton-overlay:not([data-theme="light"]) .fluentez-skeleton-block {
        background-color: var(--fluentez-skel-bg, #334155);
      }
    }

    .fluentez-skeleton-overlay[data-theme="dark"] .fluentez-skeleton-block {
      background-color: var(--fluentez-skel-bg, #334155);
    }

    .fluentez-skeleton-overlay[data-theme="light"] .fluentez-skeleton-block {
      background-color: var(--fluentez-skel-bg, #cbd5e1);
    }

    /* Shimmer Animation */
    .fluentez-skeleton-anim-shimmer::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        var(--fluentez-skel-highlight, rgba(255, 255, 255, 0.4)) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: fluentez-shimmer 1.5s infinite;
    }

    .fluentez-skeleton-overlay[data-theme="dark"] .fluentez-skeleton-anim-shimmer::after {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        var(--fluentez-skel-highlight, rgba(255, 255, 255, 0.08)) 50%,
        rgba(255, 255, 255, 0) 100%
      );
    }

    @keyframes fluentez-shimmer {
      100% {
        transform: translateX(100%);
      }
    }

    /* Pulse Animation */
    .fluentez-skeleton-anim-pulse {
      animation: fluentez-pulse 1.5s ease-in-out infinite alternate;
    }

    @keyframes fluentez-pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
      100% {
        opacity: 1;
      }
    }

    /* Wave Animation */
    .fluentez-skeleton-anim-wave::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        -45deg,
        rgba(255, 255, 255, 0) 40%,
        var(--fluentez-skel-highlight, rgba(255, 255, 255, 0.5)) 50%,
        rgba(255, 255, 255, 0) 60%
      );
      background-size: 200% 200%;
      animation: fluentez-wave 2s infinite linear;
    }

    @keyframes fluentez-wave {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `;

  document.head.appendChild(styleEl);
}
