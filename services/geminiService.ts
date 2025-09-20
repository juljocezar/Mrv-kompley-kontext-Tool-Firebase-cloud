import { GoogleGenAI, GenerateContentResponse, Schema, Part } from "@google/genai";
import { AISettings } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const callQueue: (() => Promise<void>)[] = [];
let isProcessing = false;
const THROTTLE_DELAY = 1500; // 1.5 seconds delay between calls

/**
 * @en Processes the call queue, ensuring that API calls are throttled.
 * @de Verarbeitet die Aufrufliste und stellt sicher, dass API-Aufrufe gedrosselt werden.
 */
async function processQueue() {
    if (isProcessing || callQueue.length === 0) {
        return;
    }
    isProcessing = true;
    const task = callQueue.shift();
    if (task) {
        await task();
    }
    setTimeout(() => {
        isProcessing = false;
        processQueue();
    }, THROTTLE_DELAY);
}

/**
 * @en Makes a throttled call to the Gemini API to generate content.
 *     It adds the request to a queue and processes it sequentially with a delay.
 * @de Führt einen gedrosselten Aufruf an die Gemini-API durch, um Inhalte zu generieren.
 *     Die Anfrage wird einer Warteschlange hinzugefügt und sequenziell mit einer Verzögerung verarbeitet.
 * @param contents - The content to send to the model. Can be a string or an array of strings and Parts.
 * @param jsonSchema - An optional JSON schema to structure the response. If provided, the response will be JSON.
 * @param settings - The AI settings for the generation, such as temperature and topP.
 * @returns A promise that resolves with the generated text from the API.
 */
export const callGeminiAPIThrottled = <T,>(
    contents: string | (string | Part)[],
    jsonSchema: T | null,
    settings: AISettings
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const task = async () => {
            try {
                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: contents,
                    config: {
                        temperature: settings.temperature,
                        topP: settings.topP,
                        ...(jsonSchema && {
                            responseMimeType: "application/json",
                            responseSchema: jsonSchema as Schema,
                        }),
                    }
                });
                
                const text = response.text;
                if (!text) {
                    throw new Error("Empty response from API");
                }
                resolve(text);
            } catch (error) {
                console.error("Error calling Gemini API:", error);
                reject(error);
            }
        };

        callQueue.push(task);
        processQueue();
    });
};