import React from 'react';
import type { Risks } from '../../types';

/**
 * @en Props for the StrategyTab component.
 * @de Props für die StrategyTab-Komponente.
 */
interface StrategyTabProps {
    /**
     * @en An object representing the selected risks for the case.
     * @de Ein Objekt, das die ausgewählten Risiken für den Fall darstellt.
     */
    risks: Risks;
    /**
     * @en Function to update the selected risks.
     * @de Funktion zur Aktualisierung der ausgewählten Risiken.
     */
    setRisks: React.Dispatch<React.SetStateAction<Risks>>;
    /**
     * @en The generated mitigation strategies as a string (can contain HTML).
     * @de Die generierten Minderungsstrategien als String (kann HTML enthalten).
     */
    mitigationStrategies: string;
    /**
     * @en Callback to trigger the generation of mitigation strategies.
     * @de Callback zum Auslösen der Generierung von Minderungsstrategien.
     */
    onGenerateMitigationStrategies: () => void;
    /**
     * @en Flag indicating if strategies are being generated.
     * @de Flag, das anzeigt, ob Strategien generiert werden.
     */
    isLoading: boolean;
}

const riskOptions = [
    { id: 'physical', label: 'Physical Security / Physische Sicherheit' },
    { id: 'legal', label: 'Legal Risks / Rechtliche Risiken' },
    { id: 'digital', label: 'Digital Security / Digitale Sicherheit' },
    { id: 'intimidation', label: 'Intimidation/Threats / Einschüchterung/Bedrohung' },
    { id: 'evidenceManipulation', label: 'Evidence Manipulation / Beweismanipulation' },
    { id: 'secondaryTrauma', label: 'Secondary Trauma / Sekundärtraumatisierung' },
    { id: 'burnout', label: 'Team Burnout / Burnout des Teams' },
    { id: 'psychologicalBurden', label: 'Client\'s Psychological Burden / Psychische Belastung des Mandanten' },
];

/**
 * @en A tab for strategy and risk management. It allows users to select relevant risks
 *     and generate corresponding mitigation strategies.
 * @de Ein Tab für Strategie und Risikomanagement. Er ermöglicht es den Benutzern, relevante
 *     Risiken auszuwählen und entsprechende Minderungsstrategien zu generieren.
 * @param props - The component props.
 * @returns A React functional component.
 */
const StrategyTab: React.FC<StrategyTabProps> = ({ risks, setRisks, mitigationStrategies, onGenerateMitigationStrategies, isLoading }) => {
    
    /**
     * @en Toggles the selection state of a risk.
     * @de Schaltet den Auswahlstatus eines Risikos um.
     * @param riskId - The key of the risk to toggle.
     */
    const handleRiskChange = (riskId: keyof Risks) => {
        setRisks(prev => ({ ...prev, [riskId]: !prev[riskId] }));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Strategy & Risk Management / Strategie & Risikomanagement</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Risk Assessment / Risikobewertung</h2>
                    <p className="text-sm text-gray-400 mb-4">Select the risks relevant to this case. / Wählen Sie die für diesen Fall relevanten Risiken aus.</p>
                    <div className="space-y-3">
                        {riskOptions.map(option => (
                            <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={risks[option.id as keyof Risks]}
                                    onChange={() => handleRiskChange(option.id as keyof Risks)}
                                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-300">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">Mitigation Strategies / Minderungsstrategien</h2>
                         <button 
                            onClick={onGenerateMitigationStrategies}
                            disabled={isLoading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Generating... / Generiere...' : 'Suggest Strategy / Strategie vorschlagen'}
                        </button>
                    </div>
                    <div className="flex-grow bg-gray-700 text-gray-200 p-3 rounded-md border border-gray-600 overflow-y-auto">
                         {isLoading ? (
                            <p>Generating strategies... / Strategien werden generiert...</p>
                         ) : mitigationStrategies ? (
                            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: mitigationStrategies }}></div>
                         ) : (
                            <p className="text-gray-400">No strategies generated. Select risks and click "Suggest Strategy". / Keine Strategien generiert. Wählen Sie Risiken aus und klicken Sie auf "Strategie vorschlagen".</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StrategyTab;