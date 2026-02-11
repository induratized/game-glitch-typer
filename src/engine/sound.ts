// Simple sound manager
// Uses Web Audio API for SFX and SpeechSynthesis for Announcer

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);

export const resumeAudio = async () => {
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
};

export const setMuted = (muted: boolean) => {
    masterGain.gain.setTargetAtTime(muted ? 0 : 1, audioCtx.currentTime, 0.01);
};

const createOscillator = (freq: number, type: OscillatorType, duration: number) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
};

export const playSound = (type: 'type' | 'error' | 'success' | 'crash') => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    switch (type) {
        case 'type':
            // High pitch short click
            createOscillator(800, 'square', 0.05);
            break;
        case 'success':
            // Uplifting chord
            createOscillator(440, 'sine', 0.2);
            createOscillator(554, 'sine', 0.2); // C#
            createOscillator(659, 'sine', 0.2); // E
            break;
        case 'error':
            // Low buzz
            createOscillator(150, 'sawtooth', 0.3);
            createOscillator(100, 'sawtooth', 0.3);
            break;
        case 'crash':
            // Chaos
            for (let i = 0; i < 5; i++) {
                setTimeout(() => createOscillator(100 + Math.random() * 200, 'sawtooth', 0.5), i * 100);
            }
            break;
    }
};

const synth = window.speechSynthesis;

export const speak = (text: string) => {
    if (!synth) return;
    // Cancel previous speech to prioritize new one
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    utterance.pitch = 0.8; // Lower pitch for "Tekken" feel

    // Try to find a cool voice
    const voices = synth.getVoices();
    const maleVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Male'));
    if (maleVoice) utterance.voice = maleVoice;

    synth.speak(utterance);
};

export const cancelSpeech = () => {
    if (synth) synth.cancel();
};
