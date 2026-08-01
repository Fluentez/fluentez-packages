# @fluentez/ui

Zero-dependency 100% matching UI skeleton screen generator for Vanilla JavaScript and React applications.

Automatically inspects existing DOM elements—measuring layout geometries, spacing, text heights, images, inputs, and border radiuses—to generate pixel-perfect skeleton loading placeholders with customizable animations.

## Key Features

- **100% Geometry Match**: Reads computed styles and bounding rects directly from existing UI elements.
- **Zero External Dependencies**: Pure native Web APIs (`getBoundingClientRect`, `getComputedStyle`, CSS keyframe animations).
- **Vanilla JS & React**: Built-in support for standard DOM manipulation and React hooks/components.
- **Custom Animations**: Smooth built-in `shimmer`, `pulse`, `wave`, or `none` animation modes.
- **Flexible Exclusions**: Skip or preserve specific elements using selectors or predicate functions (`exclude`, `keep`, `data-skeleton-ignore`, `data-skeleton-keep`).
- **Dark/Light Theme Support**: Automatic color palette detection based on system preferences or custom color themes.

---

## Quick Navigation Index

| Feature / API | Subpath Import Path | Quick Direct Links |
| :--- | :--- | :--- |
| **`createSkeleton`** (Vanilla Core) | `@fluentez/ui` | [Overview](#key-features) \| [Parameters](#options-skeletonoptions) \| [Returns](#return-value-skeletoncontroller) \| [Vanilla Examples](#vanilla-javascript) |
| **`SkeletonContainer`** (React Component) | `@fluentez/ui/react` | [React Component Usage](#option-1-skeletoncontainer-component) \| [Data Attributes](#html-data-attributes) |
| **`useSkeleton`** (React Hook) | `@fluentez/ui/react` | [React Hook Usage](#option-2-useskeleton-hook) \| [API Reference](#api-reference) |

---

## Installation

```bash
bun add @fluentez/ui
# or
npm install @fluentez/ui
# or
pnpm add @fluentez/ui
```

---

## Quick Start & Examples

### Vanilla JavaScript

```typescript
import { createSkeleton } from '@fluentez/ui';

const targetCard = document.querySelector('#user-profile-card');

// 1. Create skeleton loader overlay matching targetCard UI
const skeleton = createSkeleton(targetCard, {
  animation: 'shimmer',
  theme: 'auto',
  borderRadius: 'auto',
  fadeDuration: 250,
});

// 2. Hide skeleton and restore original UI once data is loaded
fetchUserData().then((user) => {
  renderUserProfile(user);
  skeleton.restore();
});
```

### Advanced Customization (Custom Theme Palette & Exclusions)

```typescript
import { createSkeleton } from '@fluentez/ui';

const skeleton = createSkeleton('#product-card', {
  animation: 'wave',
  theme: {
    background: '#1e1e2e',
    skeleton: '#313244',
    highlight: 'rgba(255, 255, 255, 0.12)',
  },
  borderRadius: 12,
  // Skip action buttons
  exclude: '.action-btn, button',
  // Keep brand logo visible untouched
  keep: '.brand-logo',
});
```

### React Integration

#### Option 1: `<SkeletonContainer>` Component

```tsx
import React from 'react';
import { SkeletonContainer } from '@fluentez/ui/react';

export function ProfileCard({ user, loading }: { user?: User; loading: boolean }) {
  return (
    <SkeletonContainer loading={loading} options={{ animation: 'shimmer', theme: 'auto' }}>
      <div className="card">
        <img src={user?.avatar} alt={user?.name} className="avatar" />
        <h2>{user?.name}</h2>
        <p>{user?.bio}</p>
      </div>
    </SkeletonContainer>
  );
}
```

#### Option 2: `useSkeleton` Hook

```tsx
import React from 'react';
import { useSkeleton } from '@fluentez/ui/react';

export function UserFeed({ isLoading }: { isLoading: boolean }) {
  const containerRef = useSkeleton<HTMLDivElement>(isLoading, {
    animation: 'pulse',
  });

  return (
    <div ref={containerRef} className="feed-container">
      <article className="post-item">
        <h3>Post Title Placeholder</h3>
        <p>Post body description placeholder text.</p>
      </article>
    </div>
  );
}
```

---

## API Reference

### `createSkeleton(target, options)` / `skeletonize(target, options)`

Generates a skeleton overlay on the target element.

#### Parameters

- **`target`**: `HTMLElement | string` — Target element or selector query string.
- **`options`**: `SkeletonOptions` — Optional configuration object.

#### Options (`SkeletonOptions`)

| Option | Type | Default | Allowed Values & Description |
| :--- | :--- | :--- | :--- |
| `animation` | `'shimmer' \| 'pulse' \| 'wave' \| 'none'` | `'shimmer'` | Animation effect style for skeleton blocks. |
| `theme` | `'auto' \| 'light' \| 'dark' \| { skeleton?, highlight?, background? }` | `'auto'` | Color theme or custom object: `skeleton` (or `background`) sets base block color, `highlight` sets shimmer light streak color. |
| `borderRadius` | `'auto' \| number \| string` | `'auto'` | Border radius resolution mode (`'auto'`, number pixels, or CSS string). |
| `exclude` | `string \| ((el: HTMLElement) => boolean)` | `undefined` | Selector or predicate matching elements to skip completely. |
| `keep` | `string \| ((el: HTMLElement) => boolean)` | `undefined` | Selector or predicate matching elements to remain visible as-is. |
| `fadeDuration` | `number` | `250` | Fade-out duration in milliseconds when restoring UI. |
| `className` | `string` | `''` | Custom CSS class string for overlay container. |
| `ignoreHidden` | `boolean` | `true` | When `true`, ignores `display: none` or `visibility: hidden` elements. |

#### Return Value (`SkeletonController`)

| Method / Property | Type | Description |
| :--- | :--- | :--- |
| `restore()` | `() => void` | Removes skeleton overlay and smoothly restores original UI. |
| `skeletonElement` | `HTMLElement` | Reference to generated overlay container DOM element. |
| `targetElement` | `HTMLElement` | Reference to target container DOM element. |
| `isDestroyed` | `boolean` | Read-only boolean property indicating whether skeleton has already been restored. |

---

## HTML Data Attributes

Mark elements directly in HTML to control skeleton generation behavior without writing custom options:

- `data-skeleton-ignore`: Skips skeleton creation for this element and its children.
- `data-skeleton-keep`: Keeps this element visible and untouched inside the skeleton view (useful for brand logos or static icons).

```html
<div id="card">
  <h2>User Title</h2>
  <!-- Icon will stay visible as is during loading -->
  <svg data-skeleton-keep class="icon">...</svg>
  <!-- Action button won't be replaced by skeleton -->
  <button data-skeleton-ignore>Action</button>
</div>
```

---

## License

MIT © Fluentez Ecosystem
