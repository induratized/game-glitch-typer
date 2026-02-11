import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../useGameEngine';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to mock performance.now for deterministic timer tests if needed
// But let's start with basic state tests

describe('useGameEngine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with level 1 and idle state', () => {
        const { result } = renderHook(() => useGameEngine({ initialLevel: 1 }));

        expect(result.current.level).toBe(1);
        expect(result.current.gameState).toBe('idle');
        expect(result.current.score).toBe(0);
    });

    it('should start game on startGame call', async () => {
        const { result } = renderHook(() => useGameEngine({ initialLevel: 1 }));

        // Wait for initial fetch to finish
        // In Vitest, we can't easily "wait for useEffect" unless we check state
        // or use waitFor from RTL. Let's use waitFor.

        await act(async () => {
            await result.current.startGame();
        });

        expect(result.current.gameState).toBe('playing');
        expect(result.current.isLevelStarted).toBe(true);
        expect(result.current.fullText.length).toBeGreaterThan(0);
    });

    it('should handle correct input and increase currentInput', async () => {
        const { result } = renderHook(() => useGameEngine({ initialLevel: 1 }));

        await act(async () => {
            await result.current.startGame();
        });

        const targetChar = result.current.fullText[0][0];

        await act(async () => {
            result.current.handleInput(targetChar);
        });

        expect(result.current.currentInput).toBe(targetChar);
    });

    it('should handle mistakes and increase glitch meter', async () => {
        const { result } = renderHook(() => useGameEngine({ initialLevel: 1 }));

        await act(async () => {
            await result.current.startGame();
        });

        await act(async () => {
            result.current.handleInput('~'); // Impossible first char
        });

        expect(result.current.errors).toBe(1);
        expect(result.current.glitchMeter).toBeGreaterThan(0);
    });
});
