/**
 * @en Extracts content from a file. If the file is a text-based format, it reads it as a string.
 *     For binary files, it provides a base64 encoded string.
 * @de Extrahiert den Inhalt aus einer Datei. Wenn die Datei ein textbasiertes Format hat, wird sie als String gelesen.
 *     Für Binärdateien wird ein base64-kodierter String bereitgestellt.
 * @param file - The file to process.
 * @returns A promise that resolves with an object containing the mimeType and either the text content or the base64 content.
 * @returns Ein Promise, das mit einem Objekt aufgelöst wird, das den mimeType und entweder den Textinhalt oder den Base64-Inhalt enthält.
 */
export const extractFileContent = (file: File): Promise<{ text: string | null; base64: string | null; mimeType: string; }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            // Simple check for text files
            if (file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/xml') {
                resolve({ text: result, base64: null, mimeType: file.type });
            } else {
                // For other files, assume binary and provide base64
                const base64String = result.split(',')[1];
                resolve({ text: null, base64: base64String, mimeType: file.type });
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        // Read as text for potential text files, and as data URL for others
        if (file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/xml') {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    });
};
