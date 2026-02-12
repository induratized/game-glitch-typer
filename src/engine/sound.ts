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

// Centralized Volume Configuration
// X = Base Volume (Speech)
const BASE_VOLUME = 0.5;

export const VOLUME_CONFIG = {
    VOICE: BASE_VOLUME,       // X = 0.5
    SFX: BASE_VOLUME * 0.6,   // 0.4
    MUSIC: BASE_VOLUME * 0.25, // 0.25
};

const createOscillator = (startFreq: number, type: OscillatorType, duration: number, endFreq?: number) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);

    if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + duration);
    }

    // Use centralized SFX volume
    const vol = VOLUME_CONFIG.SFX;

    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(vol * 0.1, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
};

export const playSound = (type: 'type' | 'error' | 'success' | 'crash' | 'gameover') => {
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
        case 'gameover':
            // "Crowd Boooo" effect
            // Multiple low oscillators detuned slightly to sound like a crowd
            const baseFreq = 150;
            const detunes = [-15, -5, 0, 5, 15]; // Frequencies around base

            detunes.forEach((detune, i) => {
                // Mix of sawtooth (raspy) and triangle (hollow) for texture
                const type = i % 2 === 0 ? 'sawtooth' : 'triangle';
                const duration = 1; // Long boo

                // Create manual oscillator here since createOscillator is too simple for this texture
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(baseFreq + detune, audioCtx.currentTime);
                // Pitch bend down (disappointment)
                osc.frequency.linearRampToValueAtTime(baseFreq + detune - 30, audioCtx.currentTime + duration);

                const vol = VOLUME_CONFIG.SFX * 0.25; // Slightly quieter per voice to avoid clipping

                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.3); // Slow attack
                gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + duration - 0.5); // Sustain
                gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration); // Release

                osc.connect(gain);
                gain.connect(masterGain);

                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            });
            break;
    }
};

const synth = window.speechSynthesis;

export const speak = (text: string) => {
    if (!synth) return;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = VOLUME_CONFIG.VOICE;
    utterance.rate = 0.95; // Slower, more soothing and cautious
    utterance.pitch = 0.9; // Lower pitch, sounds slightly more "sad/fearful" but safe

    // Find a soothing female voice
    const voices = synth.getVoices();

    // Priority: Soothing/Female specifically
    const femaleVoice = voices.find(v =>
        v.name.includes('Google UK English Female') || // Very clear and polite
        v.name.includes('Samantha') || // Default Mac soothing
        v.name.includes('Microsoft Zira') || // Default Windows soothing
        (v.name.includes('Female') && v.lang.startsWith('en'))
    );

    if (femaleVoice) utterance.voice = femaleVoice;

    synth.speak(utterance);
};

export const cancelSpeech = () => {
    if (synth) synth.cancel();
};
