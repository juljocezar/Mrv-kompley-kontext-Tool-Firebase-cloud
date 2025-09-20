import React, { useState } from 'react';
// Imported AppState type to resolve missing module member error.
import { AppState } from '../../types';
import { buildCaseContext } from '../../utils/contextUtils';

/**
 * @en Props for the ReportsTab component.
 * @de Props für die ReportsTab-Komponente.
 */
interface ReportsTabProps {
    /**
     * @en Function to generate a report based on a prompt.
     * @de Funktion zur Generierung eines Berichts basierend auf einer Anweisung.
     */
    onGenerateReport: (prompt: string, schema: object | null) => Promise<string>;
    /**
     * @en The entire application state, used to build the case context.
     * @de Der gesamte Anwendungszustand, der zum Erstellen des Fallkontexts verwendet wird.
     */
    appState: AppState;
}

/**
 * @en A tab for generating various types of reports based on the overall case context.
 * @de Ein Tab zur Erstellung verschiedener Arten von Berichten basierend auf dem gesamten Fallkontext.
 * @param props - The component props.
 * @returns A React functional component.
 */
const ReportsTab: React.FC<ReportsTabProps> = ({ onGenerateReport, appState }) => {
    const [reportType, setReportType] = useState('summary');
    const [generatedReport, setGeneratedReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * @en Handles the generation of the selected report type.
     * @de Behandelt die Generierung des ausgewählten Berichtstyps.
     */
    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedReport('');
        
        // Corrected call to buildCaseContext to pass appState as an argument.
        const context = buildCaseContext(appState);
        let prompt = `Based on the following case context, create a report. Context:\n${context}\n\n / Basierend auf dem folgenden Fallkontext, erstelle einen Bericht. Kontext:\n${context}\n\n`;

        switch (reportType) {
            case 'summary':
                prompt += "Create a comprehensive summary report of the entire case. Structure the report into: Introduction, Main Actors, Chronology of Events, Current Legal Situation, and Recommendations. / Erstelle einen umfassenden zusammenfassenden Bericht des gesamten Falls. Gliedere den Bericht in: Einleitung, Hauptakteure, Chronologie der Ereignisse, aktuelle rechtliche Situation, und Empfehlungen.";
                break;
            case 'risk':
                prompt += "Create a detailed risk analysis report. Identify all potential risks for the client and the organization. Assess the probability and potential damage for each risk and propose concrete mitigation measures. / Erstelle einen detaillierten Risikoanalysebericht. Identifiziere alle potenziellen Risiken für den Mandanten und die Organisation. Bewerte die Wahrscheinlichkeit und das Schadenspotenzial für jedes Risiko und schlage konkrete Minderungsmaßnahmen vor.";
                break;
            case 'chronology':
                prompt += "Create a report that exclusively contains a detailed, chronological list of all known events. For each item, provide the date, a description, and the sources. / Erstelle einen Bericht, der ausschließlich eine detaillierte, chronologische Auflistung aller bekannten Ereignisse enthält. Gib zu jedem Punkt das Datum, eine Beschreibung und die Quellen an.";
                break;
        }

        try {
            const report = await onGenerateReport(prompt, null);
            setGeneratedReport(report);
        } catch (error) {
            setGeneratedReport("Error during report generation. / Fehler bei der Berichterstellung.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Report Generation / Berichterstellung</h1>

            <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-6">
                <div>
                    <label htmlFor="reportType" className="block text-sm font-medium text-gray-300 mb-1">Select Report Type / Berichtstyp auswählen</label>
                    <select
                        id="reportType"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="bg-gray-700 text-gray-200 p-2 rounded-md border border-gray-600"
                    >
                        <option value="summary">Summary Report / Zusammenfassender Bericht</option>
                        <option value="risk">Risk Analysis Report / Risikoanalyse-Bericht</option>
                        <option value="chronology">Chronology Report / Chronologie-Bericht</option>
                    </select>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="self-end px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md disabled:bg-gray-500"
                >
                    {isLoading ? 'Generating... / Generiere...' : 'Create Report / Bericht erstellen'}
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg min-h-[400px]">
                <h2 className="text-xl font-semibold text-white mb-4">Generated Report / Generierter Bericht</h2>
                {isLoading && <p className="text-gray-400">Generating report, please wait... / Bericht wird generiert, bitte warten...</p>}
                <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                    {generatedReport}
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;