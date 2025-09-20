
// Fix: Removed unused and now incorrect async DB calls.
import { AppState } from '../types';

/**
 * @en Builds a string representation of the current case context from the application state.
 *     This context is used to provide relevant information to AI agents.
 * @de Erstellt eine Zeichenfolgendarstellung des aktuellen Fallkontexts aus dem Anwendungszustand.
 *     Dieser Kontext wird verwendet, um KI-Agenten relevante Informationen bereitzustellen.
 * @param appState - The current state of the application.
 * @returns A formatted string containing the case context.
 * @returns Ein formatierter String, der den Fallkontext enthält.
 */
export const buildCaseContext = (appState: AppState): string => {
    const { caseDescription, documents, caseEntities } = appState;

    let context = `**Case Description / Fallbeschreibung:**\n${caseDescription || 'No description available. / Keine Beschreibung verfügbar.'}\n\n`;

    if (documents.length > 0) {
        context += `**Existing Documents / Vorhandene Dokumente (${documents.length}):**\n`;
        // Use a limited number of docs for context to avoid being too verbose
        documents.slice(0, 5).forEach(doc => {
            context += `- ${doc.name} (Type/Typ: ${doc.type}, Status: ${doc.classificationStatus})\n`;
        });
        context += '\n';
    }
    
    if (caseEntities.length > 0) {
        context += `**Known Entities / Bekannte Entitäten (${caseEntities.length}):**\n`;
        caseEntities.slice(0, 10).forEach(entity => {
            context += `- ${entity.name} (${entity.type}): ${entity.description}\n`;
        });
        context += '\n';
    }

    // Since caseSummary is transient (not in DB per spec), we can't add it here reliably.
    // The core context is based on persisted data.
    // Da caseSummary flüchtig ist (laut Spezifikation nicht in der DB), können wir es hier nicht zuverlässig hinzufügen.
    // Der Kernkontext basiert auf persistenten Daten.

    return context;
};