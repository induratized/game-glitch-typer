import { describe, it, expect } from 'vitest';
import { toLeetSpeak, scrambleInternal, swapAdjacent } from '../GlitchGenerators';

describe('GlitchGenerators', () => {
    describe('toLeetSpeak', () => {
        it('should replace characters according to LEET_MAP up to 3 chars', () => {
            expect(toLeetSpeak('aeost')).toBe('430st');
        });

        it('should respect the max 3 replacements limit', () => {
            const result = toLeetSpeak('aeosto');
            // aeos -> 4305 (4 replacements) BUT the code has count < 3 check BEFORE incrementing.
            // Let's re-read: if (count < 3) { count++; return map; }
            // So it replaces 3 characters and stops.
            expect(result).toBe('430sto');
        });
    });

    describe('scrambleInternal', () => {
        it('should keep first and last characters intact', () => {
            const word = 'glitchy';
            const scrambled = scrambleInternal(word, 123);
            expect(scrambled[0]).toBe('g');
            expect(scrambled[scrambled.length - 1]).toBe('y');
            expect(scrambled.length).toBe(word.length);
        });

        it('should be deterministic with the same seed', () => {
            const word = 'determinism';
            const s1 = scrambleInternal(word, 42);
            const s2 = scrambleInternal(word, 42);
            expect(s1).toBe(s2);
        });

        it('should return short words unchanged', () => {
            expect(scrambleInternal('abc')).toBe('abc');
            expect(scrambleInternal('it')).toBe('it');
        });
    });

    describe('swapAdjacent', () => {
        it('should swap characters in the middle third', () => {
            const word = 'abcdef'; // length 6, start=2, end=4
            // chars at 2 and 3 are 'c' and 'd'
            expect(swapAdjacent(word)).toBe('abdcef');
        });

        it('should return very short words unchanged', () => {
            expect(swapAdjacent('ab')).toBe('ab');
        });
    });
});
