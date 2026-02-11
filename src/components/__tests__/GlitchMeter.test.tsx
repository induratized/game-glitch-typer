import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlitchMeter } from '../GlitchMeter';

describe('GlitchMeter', () => {
    it('renders with correct stability percentage', () => {
        render(<GlitchMeter value={20} />);
        expect(screen.getByText(/SYSTEM STABILITY: 80%/i)).toBeDefined();
    });

    it('renders with 0 stability when value is 100', () => {
        render(<GlitchMeter value={100} />);
        expect(screen.getByText(/SYSTEM STABILITY: 0%/i)).toBeDefined();
    });

    it('applies different gradients based on value (ice)', () => {
        const { container } = render(<GlitchMeter value={10} />);
        const bar = container.querySelector('.bg-gradient-to-r');
        expect(bar?.className).toContain('from-cyan-400');
    });

    it('applies different gradients based on value (fire)', () => {
        const { container } = render(<GlitchMeter value={80} />);
        const bar = container.querySelector('.bg-gradient-to-r');
        expect(bar?.className).toContain('from-orange-500');
        expect(bar?.className).toContain('animate-pulse');
    });

    it('shows flash effect in fire state', () => {
        const { container } = render(<GlitchMeter value={90} />);
        const flash = container.querySelector('.animate-flash');
        expect(flash).toBeDefined();
    });
});
