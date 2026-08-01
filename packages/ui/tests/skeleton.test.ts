import { describe, test, expect, beforeEach } from 'bun:test';
import { GlobalWindow } from 'happy-dom';

const win = new GlobalWindow();
globalThis.window = win as unknown as Window & typeof globalThis;
globalThis.document = win.document as unknown as Document;
globalThis.HTMLElement = win.HTMLElement as unknown as typeof HTMLElement;
globalThis.Node = win.Node as unknown as typeof Node;

import { createSkeleton, skeletonize } from '../src/skeleton';

describe('@fluentez/ui Skeleton Generator', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'target-container';
    container.style.width = '300px';
    container.style.height = '200px';

    const title = document.createElement('h1');
    title.textContent = 'Test Title';
    title.style.width = '200px';
    title.style.height = '30px';

    const avatar = document.createElement('img');
    avatar.src = 'avatar.png';
    avatar.style.width = '50px';
    avatar.style.height = '50px';
    avatar.style.borderRadius = '50%';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Lorem ipsum dolor sit amet.';
    paragraph.style.width = '250px';
    paragraph.style.height = '40px';

    container.appendChild(title);
    container.appendChild(avatar);
    container.appendChild(paragraph);
    document.body.appendChild(container);
  });

  test('should create skeleton overlay element on target container', () => {
    const controller = createSkeleton(container, { animation: 'shimmer' });
    expect(controller.isDestroyed).toBe(false);

    const overlay = container.querySelector('.fluentez-skeleton-overlay');
    expect(overlay).not.toBeNull();
  });

  test('should support string selector target', () => {
    const controller = createSkeleton('#target-container');
    expect(controller.targetElement).toBe(container);
    controller.restore();
  });

  test('should restore original UI state when restore() is called', () => {
    const controller = createSkeleton(container, { fadeDuration: 0 });
    expect(controller.isDestroyed).toBe(false);

    controller.restore();
    expect(controller.isDestroyed).toBe(true);
  });

  test('should honor exclude option', () => {
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.className = 'skip-me';
    container.appendChild(button);

    const controller = createSkeleton(container, {
      exclude: '.skip-me',
    });

    expect(button.style.visibility).not.toBe('hidden');
    controller.restore();
  });

  test('should match element dimensions and positions 100%', () => {
    container.getBoundingClientRect = () => ({ top: 0, left: 0, width: 300, height: 200 } as DOMRect);
    const title = container.querySelector('h1')!;
    title.getBoundingClientRect = () => ({ top: 10, left: 15, width: 200, height: 30 } as DOMRect);

    const controller = createSkeleton(container);
    const blocks = container.querySelectorAll('.fluentez-skeleton-block');
    expect(blocks.length).toBeGreaterThan(0);

    const firstBlock = blocks[0] as HTMLElement;
    expect(firstBlock.style.width).toBe('200px');
    expect(firstBlock.style.height).toBe('30px');
    expect(firstBlock.style.top).toBe('10px');
    expect(firstBlock.style.left).toBe('15px');

    controller.restore();
  });

  test('should alias skeletonize function', () => {
    const controller = skeletonize(container);
    expect(controller).toBeDefined();
    expect(controller.restore).toBeTypeOf('function');
    controller.restore();
  });
});
