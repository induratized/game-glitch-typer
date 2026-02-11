import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock components that use heavy animations or requestAnimationFrame which JSDOM chokes on
vi.mock('../components/RoamingMascots', () => ({
    default: () => <div data-testid="roaming-mascots" />
}));

vi.mock('../components/Mascot', () => ({
    __esModule: true,
    default: () => <div data-testid="mascot" />,
    Mood: {
        ICE: 'ice',
        WATER: 'water',
        FIRE: 'fire'
    }
}));

describe('App Integration', () => {
    it('renders the title and initial state', async () => {
        render(<App />);
        expect(screen.getAllByText(/GLITCH TYPER/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/READY TO TYP_\?/i)).toBeDefined();
    });

    it('starts the game when clicking start button', async () => {
        render(<App />);
        const startBtn = screen.getByText(/\[ PRESS ENTER \]/i);
        fireEvent.click(startBtn);

        await waitFor(() => {
            expect(screen.getByTestId('glitch-meter')).toBeDefined();
        }, { timeout: 3000 });
    });

    it('opens settings modal', () => {
        render(<App />);
        const settingsBtn = screen.getByTitle(/Settings/i);
        fireEvent.click(settingsBtn);
        // Look for the "Settings" text in the modal header
        expect(screen.getByText(/Settings/i)).toBeDefined();
    });
});
