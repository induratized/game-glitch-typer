import { getRandomSentence } from './content';

/**
 * Fetches random facts (simple natural English) from the MeowFacts API.
 * Uses HTTPS and includes a strict sanitizer to ensure "Pure English" (no symbols/digits).
 */
export async function fetchParagraph(): Promise<string> {
    try {
        const response = await fetch('https://meowfacts.herokuapp.com/?count=2', {
            method: 'GET',
        });

        if (!response.ok) throw new Error('API Response Error');

        const json = await response.json();
        const rawText = (json.data || []).join(' ');

        // Strict Sanitizer: Keep only A-Z, a-z, and spaces.
        let sanitized = rawText
            .replace(/[^a-zA-Z\s]/g, '') // Strip symbols, digits, punctuation
            .replace(/\s+/g, ' ')        // Normalize spaces
            .toLowerCase()               // Enforce lowercase
            .trim();

        // Truncate to ~150 chars at nearest word
        if (sanitized.length > 150) {
            const lastSpace = sanitized.lastIndexOf(' ', 150);
            sanitized = sanitized.substring(0, lastSpace > 0 ? lastSpace : 150);
        }

        return sanitized || getRandomSentence();
    } catch (error) {
        console.warn('API fetch failed, using fallback content:', error);
        return getRandomSentence();
    }
}

/**
 * Pre-fetches a batch of paragraphs.
 */
export async function fetchParagraphBatch(count: number): Promise<string[]> {
    const promises = Array.from({ length: count }, () => fetchParagraph());
    return Promise.all(promises);
}
