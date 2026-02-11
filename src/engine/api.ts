import { getRandomSentence } from './content';

/**
 * Fetches a random paragraph from Metaphorpsum API.
 * Returns 2-3 sentences of text.
 * Falls back to local sentences if the API fails or is slow.
 */
export async function fetchParagraph(): Promise<string> {
    try {
        const response = await fetch('http://metaphorpsum.com/paragraphs/1/3', {
            method: 'GET',
        });

        if (!response.ok) throw new Error('API Response Error');

        const text = await response.text();
        return text.trim();
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
