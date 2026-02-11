import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Integration', () => {
    it('renders the title and initial state', async () => {
        render(<App />);

        // Wait for loading to finish so we can see the start screen content
        await waitFor(() => {
            expect(screen.queryByText(/FETCHING_DATA_NODES/i)).toBeNull();
        }, { timeout: 4000 });

        expect(screen.getByRole('heading', { name: /GLITCH TYPER/i })).toBeDefined();
        expect(screen.getByText(/INITIALIZE PROTOCOL_ZERO/i)).toBeDefined();
    });

    it('starts the game when clicking start button', async () => {
        render(<App />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText(/FETCHING_DATA_NODES/i)).toBeNull();
        }, { timeout: 4000 });

        // Click Start Button
        const startBtn = screen.getByText(/\[ PRESS ENTER TO START \]/i);
        fireEvent.click(startBtn);

        await waitFor(() => {
            expect(screen.queryByText(/INITIALIZE PROTOCOL_ZERO/i)).toBeNull();
        }, { timeout: 3000 });
    });

    it('toggles mute state', () => {
        render(<App />);
        const muteBtn = screen.getByLabelText(/Toggle Mute/i);
        fireEvent.click(muteBtn);
    });
});
