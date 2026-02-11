import { getRandomSentence } from './content';

/**
 * Fetches random facts (simple natural English) from the MeowFacts API.
 * Sanitizes the response to remove control characters while preserving
 * common punctuation; enforces lowercase for game consistency.
 */
export async function fetchParagraph(): Promise<string> {
    try {
        const response = await fetch('https://meowfacts.herokuapp.com/?count=2', {
            method: 'GET',
        });

        if (!response.ok) throw new Error('API Response Error');

        const json = await response.json();
        const rawText = (json.data || []).join(' ');

        // Sanitizer: keep letters, spaces and common punctuation (. , ! ? : ; ' " - —)
        let sanitized = rawText
            .replace(/[^a-zA-Z\s\.\,\!\?\:\;\'\"\-\—]/g, '') // Remove unwanted symbols
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
