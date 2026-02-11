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
        // Use getAllByText and pick the most specific one or just assert presence
        const helloElements = screen.getAllByText((_, node) => node?.textContent === 'hello');
        expect(helloElements.length).toBeGreaterThan(0);
        expect(screen.getByText('world')).toBeDefined();
    });

    it('shows the start prompt when level is not started', () => {
        render(<TypingArea {...defaultProps} isLevelStarted={false} />);
        expect(screen.getByText(/TYPE TO START LEVEL 1/i)).toBeDefined();
    });

    it('highlights the current word', () => {
        render(<TypingArea {...defaultProps} currentIndex={0} />);
        const helloElements = screen.getAllByText((_, node) => node?.textContent === 'hello');
        const tileContainer = helloElements[0].closest('.candy-tile');
        expect(tileContainer?.className).toContain('current');
    });

    it('displays space warning when showSpaceWarning is true', () => {
        render(<TypingArea {...defaultProps} showSpaceWarning={true} />);
        expect(screen.getByText(/PRESS SPACE! 🍬/i)).toBeDefined();
    });

    it('applies rotation without crashing', () => {
        const { container } = render(<TypingArea {...defaultProps} rotation={45} />);
        expect(container.firstChild).toBeDefined();
    });

    it('shows input progress within the current word', () => {
        render(<TypingArea {...defaultProps} currentInput="he" />);
        // In the new version, 'h' and 'e' are separate spans with text-candy-mint
        const h = screen.getByText('h');
        const e = screen.getByText('e');
        const l = screen.getAllByText('l')[0];

        expect(h).toHaveClass('text-candy-mint');
        expect(e).toHaveClass('text-candy-mint');
        expect(l).toHaveClass('text-white/40');
    });
});
