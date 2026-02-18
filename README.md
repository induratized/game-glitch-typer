# Glitch Typer - Technical Documentation & Recap

This document serves as the "Source of Truth" for the game's mechanics, boundaries, and technical architecture. It is designed to onboard any developer to the systemic rules governing the *Glitch Typer* engine.

---

## 🛠 Technical Requirements & Boundaries

### 1. The Glitch Meter (Stability System)
- **Range**: 0 (Stable) to 100 (Crashed).
- **Phases**:
    - **ICE** (< 33%): Minimal visual distortion.
    - **WATER** (33% - 66%): Fluid animations, pulsing HUD.
    - **FIRE** (> 66%): Critical state. High-speed flickering, red screen effects, pulse on word completion.
- **Modifiers**:
    - **Typo**: +5 Instability.
    - **Word Timeout**: +20 Instability.
    - **Word Completion**: -10 Instability.
- **Fail Condition**: Reaching 100 triggers a "System Crash" and costs 1 Life.

### 2. Time & Lifecycle
- **Word Timer**: Fixed at **5 seconds** per word.
- **Smart Pause**: The timer **freezes** while the player is typing or within a 1-second grace period after the last keystroke. It resumes only after 1 second of idleness.
- **Lives System**: Player starts with **3 Hearts**. Loss occurs on Crash (100% Instability). 0 Lives = Game Over.

### 3. Content & Sanitization (Pure English)
- **Regex Enforcement**: `/[^a-z\s]/g`. The engine automatically strips all numbers, symbols, and punctuation.
- **Casing**: All text is forced to **lowercase** to maintain a consistent "Pure English" difficulty level regardless of the glitch layer.
- **Volume**: Paragraphs are dynamically truncated to **~150 characters** (nearest word) to maintain pace.

### 4. Level-Specific Glitch Boundaries
| Level | Effect | Boundary / Constraint |
| :--- | :--- | :--- |
| **1** | LEET | Max **3 symbols** per word to ensure readability. |
| **2** | FLICKER | Letters disappear for 0.4s to 1.5s intervals. |
| **3** | SWAP | Adjacent letters swap **only in the middle 1/3** of word. |
| **4** | FADE | Natural fade-to-black (0.5s to 2.5s duration). |
| **5** | ANAGRAM | Internal letters scrambled **deterministically** via seed. |
| **6** | BOSS | Combined effects + **15° cumulative screen rotation** on error. |

### 5. Interaction Model
- **Confirmation**: Player **must** press `Space` to advance to the next word (educational corrected feedback ensures muscle memory).
- **Auto-Advance**: Only the **final word** of a paragraph auto-advances without requiring a `Space` keypress.
- **Level 6 Recovery**: Typing **2 consecutive pristine words** (zero errors) resets the screen rotation to 0° (50% reduction on word 1, 100% on word 2).

---

## 🚀 Walkthrough & Features Implemented

## Overview
A high-intensity typing game where the user battles against a "glitching" system. The goal is to type accurately and quickly to keep the "System Stability" (Glitch Meter) from reaching dangerous levels.

## Features Implemented
### 1. Core Mechanics
- **Typing Engine**: Validates input character-by-character.
- **Glitch Meter**: Dynamic difficulty meter that transitions from **Ice (Safe)** -> **Water (Caution)** -> **Fire (Critical)**.
- **Word Timer**: Each word has a decay timer shown as a progress bar. Timeout causes a penalty and rewinds progress.

### 2. The Twist (Levels)
- **Level 1 (Leet)**: Max 3 characters leeted per word (e.g., `E` -> `3`, `A` -> `4`).
- **Level 2 (Flicker)**: Letters randomly disappear and reappear with random timing (0.4s - 1.5s).
- **Level 3 (Swap)**: Adjacent letters are swapped only in the **middle 1/3** of the word.
- **Level 4 (Fade)**: Words fade out dynamically (0.5 s - 2.5s) based on length.
- **Level 5 (Anagram)**: Internal letters scrambled.
- **Level 6 (BOSS)**: Combined effects + **15° Screen Rotation** on every error.

### 3. "Juice" & Polish
- **Combo System**: Multiplier increases with streaks.
- **Announcer**: TTS voice announces milestones (can be muted).
- **Flexible Timer**: Words now have a baseline limit of 5 seconds.
- **API Refinement**: Paragraphs are now limited to ~150 characters and normalized to **lowercase** for a consistent, "Pure English" typing experience.
- **Level 6 Recovery**: Screens that tilt due to mistakes can now be restored! Typing **2 consecutive words perfectly** (zero mistakes) will reset the rotation to 0 in two steps (50% recovery then 100% recovery).
- **Mute Feature**: Fixed the mute system to reliably silence both generated sound effects and the AI announcer voice instantly.
- **Pre-fetching Engine**: A background queue fetches several levels ahead to ensure zero lag.
- **Loading Overlay**: Sleek "FETCHING_DATA_NODES..." UI handles the initial connection state.
- **Smart Fallback**: Offline/API-failure protection using built-in high-quality sentences.
- **Smart Pause**: The timer completely stops while you are typing and only resumed after 1 second of idleness.
- **Level 5 & 6 (Stable Glitch)**: Scrambled word transformations are now deterministic. This ensures words are readable and fixed in place while you type, preventing the high-speed flickering that made Level 6 nearly impossible.
- **Space-to-Advance**: Words no longer complete automatically; you must press the **Space** key after finishing a word to confirm and move forward.
- **Completion Hint**: A pulse animation with **"[ PRESS SPACE ]"** appears above completed words.
- **Error Alert**: If you ignore the hint and keep typing (instead of hitting Space), the hint flashes **RED** and triggers an error sound to guide your muscle memory.
- **Visual Feedback**: The progress bar under the current word now visualizes this 5-second "safety window." 0 Lives = Game Over.

### 4. Testing Infrastructure (Robustness)
- **Comprehensive Test Suite**: 25 automated tests covering the entire stack.
- **Unit Testing**: Verified `GlitchGenerators` logic (leetspeak, scrambled words, swaps).
- **Hook Testing**: Validated `useGameEngine` state transitions, scoring, and level progression.
- **Component Testing**: Thoroughly tested `TypingArea` (UI feedback) and `GlitchMeter` (dynamic states).
- **Integration Testing**: End-to-end user flows in `App.tsx` (game startup, mute toggle, loading states).
- **API Mocking**: MSW (Mock Service Worker) integration for stable, reproducible API tests.

### 5. Mobile Performance Optimization (82% Bundle Reduction)
**Challenge**: The game was experiencing severe performance issues on mobile devices:
- 9.9MB bundle size causing 8+ second load times
- Laggy keyboard input and jerky animations
- Browser crashes due to heavy physics calculations
- Background music not playing on first interaction
- First keystroke not being registered

**Solutions Implemented**:

#### Asset Optimization
- **Background Music**: Compressed from 5.7MB → 718KB (87% reduction)
- **Fonts**: Removed unused shooting-star font (3.3MB saved)
- **Total Bundle**: Reduced from 9.9MB → 1.8MB (82% reduction)

#### Runtime Performance
- **Roaming Mascots**: Completely removed on mobile devices (< 768px) to eliminate physics overhead
- **CSS Transitions**: Replaced framer-motion with Tailwind CSS transitions on mobile for character tiles
- **React.memo**: Added to TypingArea component to prevent unnecessary re-renders

#### Build Optimization
- **Code Splitting**: Configured vendor chunks (react-vendor, motion-vendor, utils) in vite.config.ts
- **Terser Minification**: Enabled with console.log removal for production builds

#### Mobile UX Bug Fixes
1. **Background Music Reliability**: Refactored audio logic to ensure `audio.play()` is ONLY called from synchronous user gestures (clicks, touches, keystrokes). Created a robust `ensureAudioStarted` helper that consolidates startup logic and bypasses `useEffect` race conditions.
2. **First Keystroke Registration**: Made input comparison case-insensitive to handle mobile keyboard capitalization (keyboards show capital letters by default)
3. **Keyboard Focus Behavior**: Removed global focus listeners, keyboard now only appears during gameplay (not on home page or buttons)
4. **Play Area Tap**: Added click handler to play area allowing users to re-focus keyboard if accidentally hidden

**Results**:
- ⚡ **70-75% faster load times** (8s → 2-3s)
- 🎵 **Background music plays immediately** on first interaction
- ⌨️ **All keystrokes registered correctly** (including first keystroke)
- 📱 **Perfect mobile keyboard UX** (only shows during gameplay)
- 🚀 **Smooth 60fps gameplay** on mobile devices

---

# Completed Tasks

- [x] Game Design & Mechanics Refinement
- [x] Create Implementation Plan
- [x] Project Setup
    - [x] Initialize Vite + React + TS
    - [x] Install dependencies (framer-motion, confetti)
    - [x] Configure Tailwind & Theme
- [x] Implement Core Engine
    - [x] Word queue & Input validation
    - [x] Glitch Meter Logic (Ice -> Water -> Fire)
    - [x] Combo & Scoring System
- [x] Implement "The Twist" Levels
    - [x] Glitch Library (Leet, Shuffle, Flicker)
    - [x] Level 1-5 Implementation
    - [x] Level 6: Mix + Rotation Mechanic
- [x] Implement UI & "Juice"
    - [x] Glitch Meter Visualization
    - [x] Combo Announcer (Tekken Style TTS)
    - [x] Visual FX (Particles, Shake, Elastic UI)
- [x] Verification & Polish
    - [x] Playtesting & Tuning
- [x] Refine Game Mechanics (User Feedback)
    - [x] Lives System (3 Lives, deplete on Crash)
    - [x] Phase Transitions (Ice/Water/Fire animation)
    - [x] Victory Screen (Party scene after Level 6)
    - [x] Word Timer UX (Keep text visible on fail)
    - [x] Mute Option for Announcer
    - [x] Fix Level 3 Swap (4-letter words)
- [x] Refine Word Timer (User Feedback)
    - [x] Increase word time limit to 5 seconds
    - [x] Halt countdown while typing
    - [x] Resume countdown only after 1s idle
- [x] Implement Space-to-Advance
- [x] Integrate Public Paragraph API
- [x] Refine Game Mechanics & Fixes
    - [x] Limit paragraph length to ~150 chars
    - [x] Force lowercase
    - [x] Restore Rotation recovery logic
- [x] Setup Testing Infrastructure
    - [x] Vitest, RTL, JSdom, MSW
    - [x] @vitest/ui (Dashboard)
    - [x] 25 Passed Tests
- [x] Mobile Performance Optimization (82% Bundle Reduction)
    - [x] Asset Optimization
        - [x] Compress background music to 718KB (87% reduction from 5.7MB)
        - [x] Remove unused shooting-star font (3.3MB)
    - [x] Runtime Performance
        - [x] Remove roaming mascots entirely on mobile (< 768px)
        - [x] Replace framer-motion with Tailwind CSS transitions on mobile
        - [x] Add React.memo to TypingArea component
    - [x] Build Optimization
        - [x] Configure code splitting (react-vendor, motion-vendor, utils)
        - [x] Enable Terser minification with console.log removal
    - [x] Bug Fixes
        - [x] Fix background music autoplay on first interaction
        - [x] Fix first keystroke registration (case-insensitive input)
        - [x] Fix keyboard focus behavior (only show during gameplay)
        - [x] Add play area tap to re-focus keyboard if hidden

---

## How to Run
1. `npm install`
2. `npm run dev` (Game)
3. `npm run test` (Runner)
4. `npm run test:ui` (Dashboard)
