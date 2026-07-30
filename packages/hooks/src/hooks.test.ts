import { describe, expect, it } from 'bun:test';
import { useInfiniteScrollTop } from './useInfiniteScrollTop';
import { useScrollRestoration } from './useScrollRestoration';

describe('@fluentez/hooks module exports', () => {
  it('should export useInfiniteScrollTop function', () => {
    expect(typeof useInfiniteScrollTop).toBe('function');
  });

  it('should export useScrollRestoration function', () => {
    expect(typeof useScrollRestoration).toBe('function');
  });
});
