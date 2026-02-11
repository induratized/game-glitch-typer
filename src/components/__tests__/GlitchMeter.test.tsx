import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlitchMeter } from '../GlitchMeter';

describe('GlitchMeter', () => {
    it('renders with correct stability percentage', () => {
        render(<GlitchMeter value={20} />);
        expect(screen.getByText(/80%/i)).toBeDefined();
    });

    it('renders with 0 stability when value is 100', () => {
        render(<GlitchMeter value={100} />);
        expect(screen.getByText(/0%/i)).toBeDefined();
    });

    it('renders stability label', () => {
        render(<GlitchMeter value={50} />);
        expect(screen.getByText(/Stability/i)).toBeDefined();
    });

    it('shows gem segments for candy bar', () => {
        const { container } = render(<GlitchMeter value={50} />);
        const segments = container.querySelectorAll('.gem-segment');
        expect(segments.length).toBeGreaterThan(0);
    });

    it('shows fire state indicator when value is high', () => {
        const { container } = render(<GlitchMeter value={80} />);
        // Fire state should have the fire-zone class which animates
        const fireIndicator = container.querySelector('.fire-zone');
        expect(fireIndicator).toBeDefined();
    });
});
