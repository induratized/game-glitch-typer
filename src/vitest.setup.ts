import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock SpeechSynthesis if needed
if (typeof window !== 'undefined') {
    window.speechSynthesis = {
        speak: vi.fn(),
        cancel: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
        pause: vi.fn(),
        resume: vi.fn(),
        onvoiceschanged: null,
        pending: false,
        speaking: false,
        paused: false,
    } as any;
}

// Mock AudioContext if needed
if (typeof window !== 'undefined') {
    (window as any).AudioContext = vi.fn().mockImplementation(function () {
        return {
            createOscillator: vi.fn().mockReturnValue({
                connect: vi.fn(),
                start: vi.fn(),
                stop: vi.fn(),
                frequency: { setValueAtTime: vi.fn() },
                type: '',
            }),
            createGain: vi.fn().mockReturnValue({
                connect: vi.fn(),
                gain: {
                    setValueAtTime: vi.fn(),
                    exponentialRampToValueAtTime: vi.fn(),
                    setTargetAtTime: vi.fn(),
                },
            }),
            destination: {},
            currentTime: 0,
            resume: vi.fn().mockResolvedValue(undefined),
            state: 'suspended',
        };
    });
}

// MSW Server Setup
export const server = setupServer(
    http.get('https://meowfacts.herokuapp.com/', () => {
        return HttpResponse.json({ data: ["A test fact."] });
    })
);

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    cleanup();
});
afterAll(() => server.close());
