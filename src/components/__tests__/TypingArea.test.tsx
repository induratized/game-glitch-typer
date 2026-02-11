import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TypingArea } from '../TypingArea';

describe('TypingArea', () => {
    const defaultProps = {
        words: ['hello', 'world', 'glitch'],
        currentIndex: 0,
        currentInput: '',
        getDisplayWord: (word: string) => word,
        wordTimer: 100,
        level: 1,
        isLevelStarted: true,
        showSpaceWarning: false,
        rotation: 0
    };

    it('renders the visible words', () => {
        render(<TypingArea {...defaultProps} />);
        expect(screen.getByText('hello')).toBeDefined();
        expect(screen.getByText('world')).toBeDefined();
    });

    it('shows the start prompt when level is not started', () => {
        render(<TypingArea {...defaultProps} isLevelStarted={false} />);
        expect(screen.getByText(/TYPE TO START LEVEL 1/i)).toBeDefined();
    });

    it('highlights the current word', () => {
        render(<TypingArea {...defaultProps} currentIndex={0} />);
        const currentWordContainer = screen.getByText('hello').closest('div');
        expect(currentWordContainer?.className).toContain('text-white');
        expect(currentWordContainer?.className).toContain('bg-white/10');
    });

    it('displays space warning when showSpaceWarning is true', () => {
        render(<TypingArea {...defaultProps} showSpaceWarning={true} />);
        expect(screen.getByText(/\[ PRESS SPACE \]/i)).toBeDefined();
    });

    it('applies rotation without crashing', () => {
        const { container } = render(<TypingArea {...defaultProps} rotation={45} />);
        expect(container.firstChild).toBeDefined();
    });

    it('shows input progress within the current word', () => {
        render(<TypingArea {...defaultProps} currentInput="he" />);
        expect(screen.getByText('he')).toHaveClass('text-green-400');
        expect(screen.getByText('llo')).toHaveClass('text-white/80');
    });
});
