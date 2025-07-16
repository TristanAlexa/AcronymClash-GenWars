// This service is now a placeholder. All Gemini API calls are made on the dedicated server.

import { Generation } from '../types';

const MOCK_DELAY = 1000;

const generateMockAcronym = (letterCount: number): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < letterCount; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
};

const generateMockBackronym = (acronym: string, generation: Generation, theme: string): string => {
    const mockPhrases: Record<Generation, string[]> = {
        [Generation.GenZ]: ["Is it giving...", "No cap, that's...", "The main character energy is..."],
        [Generation.Millennials]: ["I can't even with...", "Adulting is hard when...", "Avocado toast for..."],
        [Generation.GenX]: ["Whatever, it's like...", "As if! I'm totally...", "You know, back in the day..."],
        [Generation.Boomers]: ["Well, in my day...", "They just don't make...", "A penny saved is..."]
    };
    return `${mockPhrases[generation][Math.floor(Math.random() * mockPhrases[generation].length)]} ${acronym.split('').join(' ')} (theme: ${theme})`;
};


/**
 * @deprecated All API calls are now handled by the server. This is a mock for local testing without a server.
 */
export const generateThemeAndAcronym = async (letterCount: number): Promise<{ theme: string, acronym:string }> => {
    console.warn("Using mock theme/acronym generation. This should be provided by the server.");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                theme: "Things you'd find in a weird thrift shop",
                acronym: generateMockAcronym(letterCount)
            });
        }, MOCK_DELAY);
    });
};

/**
 * @deprecated All API calls are now handled by the server. This is a mock for local testing without a server.
 */
export const generateBackronym = async (acronym: string, generation: Generation, theme: string): Promise<string> => {
    console.warn("Using mock backronym generation. This should be provided by the server.");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(generateMockBackronym(acronym, generation, theme));
        }, MOCK_DELAY);
    });
};