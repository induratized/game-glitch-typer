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

const createOscillator = (startFreq: number, type: OscillatorType, duration: number, endFreq?: number) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);

    if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + duration);
    }

    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

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
            // Bubbly "pop" (short descending sine)
            createOscillator(600, 'sine', 0.08, 200);
            break;
        case 'success':
            // "Ta-da!" Bubbly arpeggio
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                setTimeout(() => createOscillator(freq, 'sine', 0.15, freq * 1.1), i * 50);
            });
            break;
        case 'error':
            // Gentle "bonk" or "uh-oh" (descending triangle)
            createOscillator(200, 'triangle', 0.2, 80);
            break;
        case 'crash':
            // Comical "slide down"
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    createOscillator(400 - (i * 50), 'sine', 0.4, 50);
                }, i * 150);
            }
            break;
    }
};

const synth = window.speechSynthesis;

export const speak = (text: string) => {
    if (!synth) return;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 0.5;
    utterance.rate = 1.0; // Calmer, more natural speed
    utterance.pitch = 1.1; // Slightly gentle lift

    // Find a soothing female voice
    const voices = synth.getVoices();
    
    // Priority: 1. Soft/Female specifically, 2. Google UK English Female (tends to be soothing), 3. Any Female
    const femaleVoice = voices.find(v => 
        (v.name.includes('Female') && v.name.includes('Google')) || 
        v.name.includes('Crystal') || 
        v.name.includes('Zira') || 
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Female')
    );

    if (femaleVoice) utterance.voice = femaleVoice;

    synth.speak(utterance);
};

export const cancelSpeech = () => {
    if (synth) synth.cancel();
};
