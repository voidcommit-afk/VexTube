import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const CACHE_KEY_PREFIX = 'gemini_cache_';
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

// Sleep helper for exponential backoff
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Check if error is a rate limit error (429)
const isRateLimitError = (error: unknown): boolean => {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return message.includes('429') ||
            message.includes('rate limit') ||
            message.includes('quota') ||
            message.includes('resource exhausted');
    }
    return false;
};

export const generateVideoSummary = async (videoInfo: string): Promise<string> => {
    if (!API_KEY) {
        throw new Error('Gemini API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.');
    }

    if (typeof window !== 'undefined') {
        const cacheKey = `${CACHE_KEY_PREFIX}${btoa(videoInfo.substring(0, 100))}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            console.log('Serving Gemini summary from cache');
            return cached;
        }
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are an expert study assistant. Analyze the following YouTube video information and provide a **concise summary** in 3-5 bullet points. Focus on the key takeaways and main concepts.

Video Information:
${videoInfo}

Provide the summary in markdown format with bullet points. Be brief and to the point.`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text && typeof window !== 'undefined') {
                try {
                    const cacheKey = `${CACHE_KEY_PREFIX}${btoa(videoInfo.substring(0, 100))}`;
                    localStorage.setItem(cacheKey, text);
                } catch {
                    console.warn('Storage quota exceeded, could not cache summary');
                }
            }

            return text || "Unable to generate summary.";
        } catch (error: unknown) {
            console.error(`Attempt ${attempt + 1}/${MAX_RETRIES} failed:`, error);
            lastError = error instanceof Error ? error : new Error(String(error));

            // Check for API key errors - don't retry these
            if (error instanceof Error && error.message?.includes('API_KEY_INVALID')) {
                throw new Error('Invalid Gemini API key. Please check your configuration.');
            }

            // If rate limit error and not last attempt, wait with exponential backoff
            if (isRateLimitError(error) && attempt < MAX_RETRIES - 1) {
                const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
                console.log(`Rate limit hit. Retrying in ${delayMs / 1000}s...`);
                await sleep(delayMs);
                continue;
            }

            // For non-rate-limit errors, throw immediately
            if (!isRateLimitError(error)) {
                throw new Error(`Failed to generate summary: ${lastError.message}`);
            }
        }
    }

    // All retries exhausted
    throw new Error('API quota exceeded. Please wait 1-2 minutes before trying again, or try with a different video.');
};
