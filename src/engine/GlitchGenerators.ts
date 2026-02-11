export const LEET_MAP: Record<string, string> = {
    'a': '4', 'b': '8', 'e': '3', 'g': '9', 'i': '1', 'l': '1', 'o': '0', 's': '5', 't': '7', 'z': '2',
    'A': '4', 'B': '8', 'E': '3', 'G': '9', 'I': '1', 'L': '1', 'O': '0', 'S': '5', 'T': '7', 'Z': '2'
};

/**
 * Converts a word to leetspeak based on the LEET_MAP.
 * Limits to max 3 replacements per word to keep it readable.
 */
export function toLeetSpeak(word: string): string {
    let count = 0;
    return word.split('').map(char => {
        if (LEET_MAP[char] && count < 3) {
            // 50% chance to replace if limit not reached, to distribute leetness?
            // Or greedily replace? User said "max 3 letters".
            // Let's replace greedily until 3.
            count++;
            return LEET_MAP[char];
        }
        return char;
    }).join('');
}

/**
 * Scrambles the internal letters of a word deterministically based on a seed.
 * Used for Level 5 (Anagrams) and Level 6.
 */
export function scrambleInternal(word: string, seed: number = 0): string {
    if (word.length <= 3) return word;

    const first = word[0];
    const last = word[word.length - 1];
    const middle = word.slice(1, -1).split('');

    // Simple deterministic shuffle using LCG-like pseudo-randomness based on seed
    for (let i = middle.length - 1; i > 0; i--) {
        // Pseudo-random index based on seed and loop index
        const j = Math.abs((seed * 9301 + 49297 + i) % 233280) % (i + 1);
        [middle[i], middle[j]] = [middle[j], middle[i]];
    }

    return first + middle.join('') + last;
}

/**
 * Swaps adjacent characters ONLY in the middle 1/3 of the word.
 * Used for Level 3.
 */
export function swapAdjacent(word: string): string {
    if (word.length < 3) return word;

    const chars = word.split('');
    const start = Math.floor(word.length / 3);
    const end = Math.ceil((2 * word.length) / 3);

    // Swap pairs within the middle 1/3 range
    for (let i = start; i < end - 1; i += 2) {
        [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    }

    return chars.join('');
}
