# @fluentez/hooks Technical Reference Manual

The `@fluentez/hooks` package provides specialized React hooks engineered for complex scrolling behavior, viewport state tracking, and state orchestration.

Supports direct subpath imports for maximum tree-shaking performance.

## Installation

```bash
npm install @fluentez/hooks
```

Peer Dependencies:
- `react` >= 16.8.0
- `react-dom` >= 16.8.0
- `react-router-dom` >= 6.0.0 (Optional, required for `useScrollRestoration`)

---

## Subpath Imports Overview

You can import hooks using root package imports or direct subpath exports:

```typescript
// Subpath import (Recommended for maximum tree-shaking)
import { useScrollRestoration } from '@fluentez/hooks/use-scroll-restoration';
import { useInfiniteScrollTop } from '@fluentez/hooks/use-infinite-scroll-top';

// Root import
import { useScrollRestoration, useInfiniteScrollTop } from '@fluentez/hooks';
```

---

## API Documentation

### 1. useInfiniteScrollTop

`useInfiniteScrollTop` enables reverse infinite scrolling inside overflow HTML containers (such as chat feeds or historic logs) while preserving the user's relative visual scroll offset when historic dataset batches are prepended.

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
}
```

#### Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `containerRef` | `RefObject<HTMLElement \| null>` | Yes | React ref attached to the scrollable overflow container. |
| `totalPages` | `number` | Yes | Maximum page count available from the backend service. |
| `page` | `number` | Yes | Current active pagination page index. |
| `setPage` | `Dispatch<SetStateAction<number>>` | Yes | State setter function to trigger page increments. |
| `newData` | `T[]` | Yes | Array of newly fetched data items from API responses. |
| `shouldReverse` | `boolean` | No | Default `false`. Set `true` if prepended items need array reversing. |

#### Return Value

| Property | Type | Description |
| :--- | :--- | :--- |
| `data` | `T[]` | Combined dataset array with deduplicated prepended items. |
| `setData` | `Dispatch<SetStateAction<T[]>>` | Direct state dispatcher for modifying internal list state. |

#### Usage Example

```tsx
import React, { useRef, useState, useEffect } from 'react';
import { useInfiniteScrollTop } from '@fluentez/hooks/use-infinite-scroll-top';

interface ChatMessage {
  _id: string;
  sender: string;
  text: string;
}

export function ChatFeedComponent() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(5);
  const [fetchedMessages, setFetchedMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    async function loadHistoricMessages() {
      const response = await fetch(`/api/messages?page=${page}`);
      const payload = await response.json();
      setFetchedMessages(payload.items);
      setTotalPages(payload.totalPages);
    }

    loadHistoricMessages();
  }, [page]);

  const { data: messages } = useInfiniteScrollTop<ChatMessage>(
    containerRef,
    totalPages,
    page,
    setPage,
    fetchedMessages,
    true
  );

  return (
    <div
      ref={containerRef}
      style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc' }}
    >
      {messages.map((msg) => (
        <div key={msg._id} style={{ padding: '8px' }}>
          <strong>{msg.sender}:</strong> {msg.text}
        </div>
      ))}
    </div>
  );
}
```

---

### 2. useScrollRestoration

`useScrollRestoration` restores container scroll positions when users navigate backward or forward in browser history (POP action) and automatically resets scroll positions to top when initiating new navigation actions (PUSH action).

#### Function Signature

```typescript
function useScrollRestoration<T extends HTMLElement = HTMLDivElement>(
  key: string,
  isReady?: boolean
): {
  containerRef: RefObject<T | null>;
  handleScroll: () => void;
}
```

#### Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `key` | `string` | Yes | Unique storage key for persisting scroll coordinates in `sessionStorage`. |
| `isReady` | `boolean` | No | Default `true`. Set `false` until target component layout data finishes rendering. |

#### Return Value

| Property | Type | Description |
| :--- | :--- | :--- |
| `containerRef` | `RefObject<T \| null>` | React ref to attach to target overflow element. |
| `handleScroll` | `() => void` | Debounced scroll event handler to attach to container `onScroll`. |

#### Usage Example

```tsx
import React from 'react';
import { useScrollRestoration } from '@fluentez/hooks/use-scroll-restoration';

export function DocumentFeedView() {
  const [isDataLoaded, setIsDataLoaded] = React.useState(true);
  
  const { containerRef, handleScroll } = useScrollRestoration<HTMLDivElement>(
    'document_feed_scroll_key',
    isDataLoaded
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      <h1>Document Feed</h1>
    </div>
  );
}
```
