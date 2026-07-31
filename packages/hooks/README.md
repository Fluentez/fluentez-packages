# @fluentez/hooks Technical Reference Manual

The `@fluentez/hooks` package provides specialized React hooks engineered for complex scrolling behavior, viewport state tracking, and state orchestration in modern web applications.

Supports direct subpath imports for maximum tree-shaking performance.

---

## Quick Navigation Index

| Hook                       | Subpath Import Path                       | Quick Direct Links                                                                                                                                                                  |
| :------------------------- | :---------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`useInfiniteScrollTop`** | `@fluentez/hooks/use-infinite-scroll-top` | [Overview](#1-useinfinitescrolltop) \| [Parameters](#useinfinitescrolltop-parameters) \| [Returns](#useinfinitescrolltop-returns) \| [Usage Example](#useinfinitescrolltop-example) |
| **`useScrollRestoration`** | `@fluentez/hooks/use-scroll-restoration`  | [Overview](#2-usescrollrestoration) \| [Parameters](#usescrollrestoration-parameters) \| [Returns](#usescrollrestoration-returns) \| [Usage Example](#usescrollrestoration-example) |
| **`useAvailableHeight`**   | `@fluentez/hooks/use-available-height`   | [Overview](#3-useavailableheight) \| [Parameters](#useavailableheight-parameters) \| [Returns](#useavailableheight-returns) \| [Usage Example](#useavailableheight-example)     |

---

## Prerequisites and Peer Dependencies

- `react` >= 16.8.0
- `react-dom` >= 16.8.0
- `react-router-dom` >= 6.0.0 (Optional, required for `useScrollRestoration`)

## Installation

npm:

```bash
npm install @fluentez/hooks
```

pnpm:

```bash
pnpm add @fluentez/hooks
```

bun:

```bash
bun add @fluentez/hooks
```

---

## Import Strategies

You can import hooks using root package imports or direct subpath exports:

```typescript
// Subpath import (Recommended for maximum tree-shaking)
import { useScrollRestoration } from '@fluentez/hooks/use-scroll-restoration';
import { useInfiniteScrollTop } from '@fluentez/hooks/use-infinite-scroll-top';
import { useAvailableHeight } from '@fluentez/hooks/use-available-height';

// Barrel import
import { useScrollRestoration, useInfiniteScrollTop, useAvailableHeight } from '@fluentez/hooks';
```

---

## API Specifications and Production Examples

### 1. useInfiniteScrollTop

`useInfiniteScrollTop` resolves the "scroll jump" problem in reverse scroll containers (such as chat applications, direct messaging interfaces, or historic logs). When historic data batches are loaded and prepended to the top of a list, the hook automatically calculates layout height offsets via `requestAnimationFrame` to keep the user's visual scroll focus locked seamlessly on the items they were viewing.

#### Function Signature

```typescript
function useInfiniteScrollTop<T extends { _id?: string | number; id?: string | number }>(
    containerRef: RefObject<HTMLElement | null>,
    totalPages: number,
    page: number,
    setPage: Dispatch<SetStateAction<number>>,
    newData: T[],
    shouldReverse?: boolean
): {
    data: T[];
    setData: Dispatch<SetStateAction<T[]>>;
};
```

<a id="useinfinitescrolltop-parameters"></a>

#### Parameters

| Parameter       | Type                               | Required | Default | Description                                                          |
| :-------------- | :--------------------------------- | :------- | :------ | :------------------------------------------------------------------- |
| `containerRef`  | `RefObject<HTMLElement \| null>`   | Yes      | None    | React ref attached to the scrollable overflow container element.     |
| `totalPages`    | `number`                           | Yes      | None    | Total available page count returned from the backend API.            |
| `page`          | `number`                           | Yes      | None    | Current active pagination page index.                                |
| `setPage`       | `Dispatch<SetStateAction<number>>` | Yes      | None    | React state setter function to increment current page index.         |
| `newData`       | `T[]`                              | Yes      | None    | Array of newly fetched data items from API responses.                |
| `shouldReverse` | `boolean`                          | No       | `false` | Set `true` if prepended historic data array items require reversing. |

<a id="useinfinitescrolltop-returns"></a>

#### Return Values

| Property  | Type                            | Description                                                       |
| :-------- | :------------------------------ | :---------------------------------------------------------------- |
| `data`    | `T[]`                           | Combined dataset array containing deduplicated prepended items.   |
| `setData` | `Dispatch<SetStateAction<T[]>>` | Direct state dispatcher for updating internal message/item state. |

<a id="useinfinitescrolltop-example"></a>

#### Production Real-World Usage Example: Chat Application

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteScrollTop } from '@fluentez/hooks/use-infinite-scroll-top';

interface Message {
    _id: string;
    sender: string;
    text: string;
    timestamp: string;
}

export function RealtimeChatFeed() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchedMessages, setFetchedMessages] = useState<Message[]>([]);

    // Fetch paginated historic messages from backend
    useEffect(() => {
        let isMounted = true;
        async function fetchMessageHistory() {
            setLoading(true);
            try {
                const response = await fetch(`/api/chat/messages?page=${page}&limit=20`);
                const result = await response.json();
                if (isMounted) {
                    setFetchedMessages(result.messages);
                    setTotalPages(result.totalPages);
                }
            } catch (error) {
                console.error('Failed to load message history:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchMessageHistory();
        return () => {
            isMounted = false;
        };
    }, [page]);

    // Bind hook to manage top-scroll offset recalculation
    const { data: messages } = useInfiniteScrollTop<Message>(
        containerRef,
        totalPages,
        page,
        setPage,
        fetchedMessages,
        true // Reverse array order for historic API responses
    );

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '500px',
                maxWidth: '600px',
                margin: '0 auto',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
            }}
        >
            {/* Scrollable Container */}
            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                }}
            >
                {loading && page > 1 && (
                    <div style={{ textAlign: 'center', padding: '8px', color: '#666' }}>
                        Loading older messages...
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        style={{
                            margin: '8px 0',
                            padding: '10px 14px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '6px',
                        }}
                    >
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                            {msg.sender} <span style={{ color: '#888' }}>{msg.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '14px', marginTop: '4px' }}>{msg.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

---

### 2. useScrollRestoration

`useScrollRestoration` persists and restores scroll positions across client-side router navigation events in single page applications (SPA). When a user clicks browser Back/Forward controls (POP navigation), the hook restores the previous scroll position from `sessionStorage`. When the user navigates to a new page or link (PUSH navigation), it automatically resets scroll to top.

#### Function Signature

```typescript
function useScrollRestoration<T extends HTMLElement = HTMLDivElement>(
    key: string,
    isReady?: boolean
): {
    containerRef: RefObject<T | null>;
    handleScroll: () => void;
};
```

<a id="usescrollrestoration-parameters"></a>

#### Parameters

| Parameter | Type      | Required | Default | Description                                                                                   |
| :-------- | :-------- | :------- | :------ | :-------------------------------------------------------------------------------------------- |
| `key`     | `string`  | Yes      | None    | Unique key identifier for persisting scroll coordinates in `sessionStorage`.                  |
| `isReady` | `boolean` | No       | `true`  | Set `false` until async dynamic content is rendered to prevent early scroll restored offsets. |

<a id="usescrollrestoration-returns"></a>

#### Return Values

| Property       | Type                   | Description                                                                  |
| :------------- | :--------------------- | :--------------------------------------------------------------------------- |
| `containerRef` | `RefObject<T \| null>` | React ref to attach to the target overflow HTML element.                     |
| `handleScroll` | `() => void`           | Debounced scroll listener handler (100ms) to attach to container `onScroll`. |

<a id="usescrollrestoration-example"></a>

#### Production Real-World Usage Example: Document Reader Feed with React Router

```tsx
import React, { useState, useEffect } from 'react';
import { useScrollRestoration } from '@fluentez/hooks/use-scroll-restoration';

interface Article {
    id: string;
    title: string;
    summary: string;
}

export function ArticleFeedView() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isReady, setIsReady] = useState<boolean>(false);

    // Bind scroll restoration hook with unique storage key
    const { containerRef, handleScroll } = useScrollRestoration<HTMLDivElement>(
        'article_feed_scroll_position',
        isReady
    );

    // Fetch articles async
    useEffect(() => {
        async function loadArticles() {
            const response = await fetch('/api/articles');
            const data = await response.json();
            setArticles(data);
            // Flag ready after state updates and DOM render finish
            setIsReady(true);
        }

        loadArticles();
    }, []);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
                height: '100vh',
                overflowY: 'auto',
                padding: '24px',
                backgroundColor: '#ffffff',
            }}
        >
            <h2>Article Feed</h2>

            {!isReady ? (
                <div>Loading feed articles...</div>
            ) : (
                articles.map((article) => (
                    <article
                        key={article.id}
                        style={{
                            padding: '16px',
                            marginBottom: '16px',
                            borderBottom: '1px solid #eee',
                        }}
                    >
                        <h3>{article.title}</h3>
                        <p>{article.summary}</p>
                    </article>
                ))
            )}
        </div>
    );
}
```

---

### 3. useAvailableHeight

`useAvailableHeight` dynamically computes the available vertical height for a container element by measuring the inner client height of its parent element minus the total offset height of its previous sibling (such as a header, top navigation bar, or toolbar). It uses `useLayoutEffect` and `ResizeObserver` for zero-flicker $O(1)$ calculations that update smoothly on viewport and element resize events.

#### Function Signature

```typescript
function useAvailableHeight<T extends HTMLElement = HTMLDivElement>(
    fallbackHeight?: string
): {
    ref: RefObject<T | null>;
    height: string;
};
```

<a id="useavailableheight-parameters"></a>

#### Parameters

| Parameter        | Type     | Required | Default  | Description                                                                                      |
| :--------------- | :------- | :------- | :------- | :----------------------------------------------------------------------------------------------- |
| `fallbackHeight` | `string` | No       | `'100%'` | Initial fallback CSS height string applied before DOM measurement completes (e.g., `'100%'`). |

<a id="useavailableheight-returns"></a>

#### Return Values

| Property | Type                   | Description                                                                                       |
| :------- | :--------------------- | :------------------------------------------------------------------------------------------------ |
| `ref`    | `RefObject<T \| null>` | React ref attached to the container element to be height-adjusted.                                |
| `height` | `string`               | Computed CSS pixel height string (e.g., `'782px'`) dynamically calculated from DOM dimensions.   |

<a id="useavailableheight-example"></a>

#### Production Real-World Usage Example: Dynamic Chat Interface Layout

```tsx
import React from 'react';
import { useAvailableHeight } from '@fluentez/hooks/use-available-height';

export function ChatLayoutView() {
    // Dynamically calculate available space below header/navbar without hardcoding pixels or REMs
    const { ref: containerRef, height } = useAvailableHeight<HTMLDivElement>();

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Navbar */}
            <header style={{ height: '60px', backgroundColor: '#333', color: '#fff' }}>
                Header Navigation
            </header>

            {/* Container automatically fills 100% of remaining vertical height */}
            <div ref={containerRef} style={{ height, display: 'flex', overflow: 'hidden' }}>
                <aside style={{ width: '250px', borderRight: '1px solid #ccc' }}>
                    Sidebar Menu
                </aside>
                <main style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                    Main Chat Messages Content
                </main>
            </div>
        </div>
    );
}
```

---

## Performance and Technical Design Specifications

1. **Debounced Storage Operations**: Scroll events are debounced at 100ms before writing to `sessionStorage` to eliminate main thread blocking during continuous scrolling.
2. **Layout Shift Prevention**: Scroll position restoration relies on `useLayoutEffect` to apply vertical scroll offsets before browser paint, preventing visual flicker during page popstate events.
3. **Automatic Deduplication**: `useInfiniteScrollTop` uses `Set` hashing based on item `_id` or `id` keys to prevent duplicate items when prepending data arrays.
4. **Zero-Flicker Layout Height Observer**: `useAvailableHeight` utilizes `useLayoutEffect` alongside `ResizeObserver` and `requestAnimationFrame` for $O(1)$ layout calculation, adjusting height synchronously before screen paint without main thread layout thrashing.
