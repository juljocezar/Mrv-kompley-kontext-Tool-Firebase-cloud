import React from 'react';
import type { Contradiction, Document } from '../../types';

/**
 * @en Props for the ContradictionsTab component.
 * @de Props für die ContradictionsTab-Komponente.
 */
interface ContradictionsTabProps {
    /**
     * @en The list of found contradictions.
     * @de Die Liste der gefundenen Widersprüche.
     */
    contradictions: Contradiction[];
    /**
     * @en The list of all documents, used to find document names by ID.
     * @de Die Liste aller Dokumente, die verwendet wird, um Dokumentennamen anhand der ID zu finden.
     */
    documents: Document[];
    /**
     * @en Callback function to start the contradiction analysis.
     * @de Callback-Funktion zum Starten der Widerspruchsanalyse.
     */
    onFindContradictions: () => void;
    /**
     * @en Flag indicating if the analysis is in progress.
     * @de Flag, das anzeigt, ob die Analyse läuft.
     */
    isLoading: boolean;
}

/**
 * @en A tab for analyzing and displaying potential contradictions between statements in different documents.
 * @de Ein Tab zur Analyse und Anzeige potenzieller Widersprüche zwischen Aussagen in verschiedenen Dokumenten.
 * @param props - The component props.
 * @returns A React functional component.
 */
const ContradictionsTab: React.FC<ContradictionsTabProps> = ({ contradictions, documents, onFindContradictions, isLoading }) => {
    
    /**
     * @en Gets the name of a document from its ID.
     * @de Ruft den Namen eines Dokuments anhand seiner ID ab.
     * @param docId - The ID of the document.
     * @returns The name of the document or a default string if not found.
     */
    const getDocName = (docId: string) => documents.find(d => d.id === docId)?.name || 'Unknown Document / Unbekanntes Dokument';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-white">Contradiction Analysis / Widerspruchsanalyse</h1>
                 <button 
                    onClick={onFindContradictions}
                    disabled={isLoading} 
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? 'Analyzing... / Analysiere...' : 'Start Analysis / Analyse starten'}
                </button>
            </div>
            <p className="text-gray-400">This feature analyzes all classified documents and highlights potentially contradictory statements. / Diese Funktion analysiert alle klassifizierten Dokumente und hebt potenzielle widersprüchliche Aussagen hervor.</p>
            
             {isLoading && (
                 <div className="text-center py-12 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">Analyzing documents for contradictions. This may take a moment... / Dokumente werden auf Widersprüche analysiert. Dies kann einen Moment dauern...</p>
                </div>
            )}

            {!isLoading && contradictions.length > 0 && (
                <div className="space-y-4">
                    {contradictions.map(item => (
                        <div key={item.id} className="bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-red-400 mb-3">Potential Contradiction Found / Potenzieller Widerspruch gefunden</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-t border-gray-700 py-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Statement A (from <span className="font-semibold text-gray-300">{getDocName(item.source1DocId)}</span>) / Aussage A (aus <span className="font-semibold text-gray-300">{getDocName(item.source1DocId)}</span>)</p>
                                    <blockquote className="border-l-4 border-gray-600 pl-4 text-gray-300 italic">"{item.statement1}"</blockquote>
                                </div>
                                 <div>
                                    <p className="text-sm text-gray-400 mb-1">Statement B (from <span className="font-semibold text-gray-300">{getDocName(item.source2DocId)}</span>) / Aussage B (aus <span className="font-semibold text-gray-300">{getDocName(item.source2DocId)}</span>)</p>
                                    <blockquote className="border-l-4 border-gray-600 pl-4 text-gray-300 italic">"{item.statement2}"</blockquote>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-300">AI's Explanation / Erklärung der KI:</h4>
                                <p className="text-gray-400 mt-1">{item.explanation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {!isLoading && contradictions.length === 0 && (
                 <div className="text-center py-12 bg-gray-800 rounded-lg">
                    <p className="text-gray-500">No contradictions found or analysis not yet started. / Keine Widersprüche gefunden oder Analyse noch nicht gestartet.</p>
                </div>
            )}
        </div>
    );
};

export default ContradictionsTab;
