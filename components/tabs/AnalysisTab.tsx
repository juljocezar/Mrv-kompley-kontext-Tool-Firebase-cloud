import React from 'react';
import { Document, DocumentAnalysisResults, DetailedAnalysisResults } from '../../types';

/**
 * @en Props for the AnalysisTab component.
 * @de Props für die AnalysisTab-Komponente.
 */
interface AnalysisTabProps {
    /**
     * @en The list of all documents.
     * @de Die Liste aller Dokumente.
     */
    documents: Document[];
    /**
     * @en The results of the initial document analysis (workload).
     * @de Die Ergebnisse der initialen Dokumentenanalyse (Aufwand).
     */
    documentAnalysisResults: DocumentAnalysisResults;
    /**
     * @en The results of the detailed content analysis.
     * @de Die Ergebnisse der detaillierten Inhaltsanalyse.
     */
    detailedAnalysisResults: DetailedAnalysisResults;
    /**
     * @en Callback to trigger a detailed analysis for a document.
     * @de Callback zum Auslösen einer detaillierten Analyse für ein Dokument.
     */
    onPerformDetailedAnalysis: (docId: string) => void;
    /**
     * @en Callback to trigger a correspondence analysis for a document.
     * @de Callback zum Auslösen einer Korrespondenzanalyse für ein Dokument.
     */
    onAnalyzeCorrespondence: (docId: string) => void;
    /**
     * @en Flag indicating if an analysis is in progress.
     * @de Flag, das anzeigt, ob eine Analyse läuft.
     */
    isLoading: boolean;
    /**
     * @en A string identifier for the currently loading section.
     * @de Ein String-Bezeichner für den aktuell ladenden Abschnitt.
     */
    loadingSection: string;
}

/**
 * @en A tab that displays the results of various AI-driven document analyses.
 * @de Ein Tab, der die Ergebnisse verschiedener KI-gestützter Dokumentenanalysen anzeigt.
 * @param props - The component props.
 * @returns A React functional component.
 */
const AnalysisTab: React.FC<AnalysisTabProps> = ({
    documents,
    documentAnalysisResults,
    detailedAnalysisResults,
    onPerformDetailedAnalysis,
    onAnalyzeCorrespondence,
    isLoading,
    loadingSection
}) => {
    const classifiedDocuments = documents.filter(doc => doc.classificationStatus === 'classified');

    /**
     * @en Renders the workload analysis section for a document.
     * @de Rendert den Abschnitt für die Aufwandsanalyse eines Dokuments.
     * @param docId - The ID of the document.
     * @returns A React element.
     */
    const renderWorkloadAnalysis = (docId: string) => {
        const analysis = documentAnalysisResults[docId];
        if (!analysis) return <p className="text-gray-500">No workload analysis available. / Keine Aufwandsanalyse verfügbar.</p>;

        return (
            <div className="space-y-2 text-sm">
                <p><strong>Complexity / Komplexität:</strong> <span className="capitalize">{analysis.complexity}</span> ({analysis.complexityJustification})</p>
                <p><strong>Estimated Workload / Geschätzter Aufwand:</strong> {analysis.workloadEstimate.total} hours / Stunden</p>
                <p><strong>Document Type / Dokumententyp:</strong> {analysis.documentType}</p>
                 <div>
                    <strong>Recommendations / Empfehlungen:</strong>
                    <ul className="list-disc list-inside pl-4 text-gray-400">
                        {analysis.recommendations.map((rec, i) => <li key={i}>{rec.text} (Urgency / Dringlichkeit: {rec.urgency})</li>)}
                    </ul>
                </div>
                {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
                    <div className="mt-2">
                        <strong>Suggested Next Steps / Vorgeschlagene nächste Schritte:</strong>
                        <ul className="list-disc list-inside pl-4 text-gray-400">
                            {analysis.suggestedActions.map((action, i) => <li key={i}>{action}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    /**
     * @en Renders the detailed content analysis section for a document.
     * @de Rendert den Abschnitt für die detaillierte Inhaltsanalyse eines Dokuments.
     * @param docId - The ID of the document.
     * @returns A React element.
     */
    const renderDetailedAnalysis = (docId: string) => {
        const analysis = detailedAnalysisResults[docId];
        const correspondenceAnalysis = analysis?.correspondenceAnalysis;

        return (
            <div className="mt-4">
                {!analysis ? (
                     <div className="text-center py-4">
                        <button 
                           onClick={() => onPerformDetailedAnalysis(docId)}
                           disabled={isLoading && loadingSection === `detailed-${docId}`}
                           className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
                       >
                           {isLoading && loadingSection === `detailed-${docId}` ? 'Analyzing... / Analysiere...' : 'Start Detailed Analysis / Detaillierte Analyse starten'}
                       </button>
                   </div>
                ) : (
                    <div className="space-y-3 text-sm">
                        <p><strong>Sentiment:</strong> <span className="capitalize">{analysis.sentiment}</span></p>
                        <div>
                            <strong>Keywords / Schlüsselwörter:</strong>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {(analysis.schlüsselwörter || []).map(kw => <span key={kw} className="bg-gray-600 px-2 py-1 rounded text-xs">{kw}</span>)}
                            </div>
                        </div>
                        <div>
                            <strong>Key Facts / Zentrale Fakten:</strong>
                            <ul className="list-disc list-inside pl-4 text-gray-400">{(analysis.zentrale_fakten || []).map((fact, i) => <li key={i}>{fact}</li>)}</ul>
                        </div>
                         <div>
                            <strong>Involved Parties / Beteiligte Parteien:</strong>
                            <ul className="list-disc list-inside pl-4 text-gray-400">{(analysis.beteiligte_parteien || []).map((p, i) => <li key={i}>{p.name} ({p.type})</li>)}</ul>
                        </div>
                    </div>
                )}

                <div className="border-t border-gray-600 pt-3 mt-4">
                    <h5 className="font-semibold text-gray-300 mb-2">Special Analysis: Official Correspondence / Spezialanalyse: Behördenschreiben</h5>
                    {correspondenceAnalysis ? (
                        <div className="space-y-2 text-xs text-gray-400">
                             <p><strong>Intent / Absicht:</strong> {correspondenceAnalysis.intent}</p>
                             <p><strong>Risk Assessment / Risiko:</strong> {correspondenceAnalysis.riskAssessment}</p>
                             <div>
                                <strong>Findings / Erkenntnisse:</strong>
                                <ul className="list-disc list-inside pl-4">{correspondenceAnalysis.findings.map((f, i) => <li key={i}>{f}</li>)}</ul>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => onAnalyzeCorrespondence(docId)}
                            disabled={isLoading && loadingSection === `correspondence-${docId}`}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md text-xs disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                             {isLoading && loadingSection === `correspondence-${docId}` ? '...' : 'Critical Review / Kritisch prüfen'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Analysis Center / Analyse-Zentrum</h1>
            <p className="text-gray-400">Here you can see the results of the AI-powered document analysis. / Hier sehen Sie die Ergebnisse der KI-gestützten Dokumentenanalyse.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classifiedDocuments.map(doc => (
                    <div key={doc.id} className="bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold text-blue-400 mb-3">{doc.name}</h3>
                        
                        <div className="border-b border-gray-700 pb-4">
                            <h4 className="font-bold text-gray-300 mb-2">Workload Analysis / Aufwandsanalyse</h4>
                            {renderWorkloadAnalysis(doc.id)}
                        </div>

                        <div className="pt-4">
                             <h4 className="font-bold text-gray-300 mb-2">Content Analysis / Inhaltsanalyse</h4>
                             {renderDetailedAnalysis(doc.id)}
                        </div>
                    </div>
                ))}
            </div>

            {classifiedDocuments.length === 0 && (
                <div className="text-center py-12 bg-gray-800 rounded-lg">
                    <p className="text-gray-500">No documents available for analysis. / Keine Dokumente zur Analyse verfügbar.</p>
                    <p className="text-gray-500 text-sm mt-1">Please upload documents and start the analysis in the "Documents" tab. / Bitte laden Sie Dokumente hoch und starten Sie die Analyse im "Dokumente"-Tab.</p>
                </div>
            )}
        </div>
    );
};

export default AnalysisTab;