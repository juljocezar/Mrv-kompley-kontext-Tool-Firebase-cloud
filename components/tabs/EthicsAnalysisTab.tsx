import React from 'react';
import type { EthicsAnalysis } from '../../types';

/**
 * @en Props for the EthicsAnalysisTab component.
 * @de Props für die EthicsAnalysisTab-Komponente.
 */
interface EthicsAnalysisTabProps {
    /**
     * @en The result of the ethics analysis.
     * @de Das Ergebnis der Ethik-Analyse.
     */
    analysisResult: EthicsAnalysis | null;
    /**
     * @en Callback function to perform the ethics analysis.
     * @de Callback-Funktion zur Durchführung der Ethik-Analyse.
     */
    onPerformAnalysis: () => void;
    /**
     * @en Flag indicating if the analysis is in progress.
     * @de Flag, das anzeigt, ob die Analyse läuft.
     */
    isLoading: boolean;
}

/**
 * @en A tab for performing and displaying an AI-powered analysis of the case for ethical concerns,
 *     such as data bias, privacy issues, or "do-no-harm" principles.
 * @de Ein Tab zur Durchführung und Anzeige einer KI-gestützten Analyse des Falles auf ethische Bedenken,
 *     wie z.B. Voreingenommenheit (Bias) in den Daten, Datenschutzaspekte oder "Do-No-Harm"-Prinzipien.
 * @param props - The component props.
 * @returns A React functional component.
 */
const EthicsAnalysisTab: React.FC<EthicsAnalysisTabProps> = ({ analysisResult, onPerformAnalysis, isLoading }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Ethics Analysis / Ethik-Analyse</h1>
                <button
                    onClick={onPerformAnalysis}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md disabled:bg-gray-500"
                >
                    {isLoading ? 'Analyzing... / Analysiere...' : 'Perform Analysis / Analyse durchführen'}
                </button>
            </div>
            <p className="text-gray-400">
                This section performs an AI-powered analysis of the case for ethical concerns,
                such as bias in the data, privacy aspects, or "do-no-harm" principles. /
                Dieser Bereich führt eine KI-gestützte Analyse des Falles auf ethische Bedenken,
                wie z.B. Voreingenommenheit (Bias) in den Daten, Datenschutzaspekte oder
                "Do-No-Harm"-Prinzipien durch.
            </p>

            {isLoading && (
                <div className="text-center py-12 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">Performing ethics analysis. This may take a moment... / Ethische Analyse wird durchgeführt. Dies kann einen Moment dauern...</p>
                </div>
            )}

            {!isLoading && analysisResult ? (
                <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">Bias Assessment / Bewertung der Voreingenommenheit</h2>
                        <p className="text-gray-300">{analysisResult.biasAssessment}</p>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                        <h2 className="text-xl font-semibold text-white mb-2">Privacy Concerns / Datenschutzbedenken</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            {analysisResult.privacyConcerns.map((concern, index) => (
                                <li key={index}>{concern}</li>
                            ))}
                        </ul>
                    </div>
                     <div className="border-t border-gray-700 pt-4">
                        <h2 className="text-xl font-semibold text-white mb-2">Recommendations / Handlungsempfehlungen</h2>
                         <ul className="list-disc list-inside text-gray-300 space-y-1">
                            {analysisResult.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : !isLoading && (
                <div className="text-center py-12 bg-gray-800 rounded-lg">
                    <p className="text-gray-500">No ethics analysis performed yet. / Noch keine Ethik-Analyse durchgeführt.</p>
                </div>
            )}
        </div>
    );
};

export default EthicsAnalysisTab;