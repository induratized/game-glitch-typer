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
        const sanitized = rawText
            .replace(/[^a-zA-Z\s]/g, '') // Strip symbols, digits, punctuation
            .replace(/\s+/g, ' ')        // Normalize spaces
            .trim();

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
