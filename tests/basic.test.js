import { describe, it, expect } from 'vitest';

describe('Basic Setup', () => {
    it('should have working test environment', () => {
        expect(1 + 1).toBe(2);
    });

    it('should have DOM environment', () => {
        expect(document).toBeDefined();
        expect(window).toBeDefined();
    });
});