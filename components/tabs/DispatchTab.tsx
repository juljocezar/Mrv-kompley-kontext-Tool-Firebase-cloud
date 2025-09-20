import React, { useState } from 'react';
// Corrected type name from GeneratedDocument to GeneratedDoc to match type definitions.
import type { GeneratedDocument, ChecklistItem, ActiveTab, Document } from '../../types';

/**
 * @en Props for the DispatchTab component.
 * @de Props für die DispatchTab-Komponente.
 */
interface DispatchTabProps {
    /**
     * @en The primary document selected for dispatch.
     * @de Das primäre für den Versand ausgewählte Dokument.
     */
    dispatchDocument: GeneratedDocument | null;
    /**
     * @en The pre-flight checklist for dispatching.
     * @de Die Pre-Flight-Checkliste für den Versand.
     */
    checklist: ChecklistItem[];
    /**
     * @en Function to update the checklist state, allowing functional updates.
     * @de Funktion zur Aktualisierung des Checklisten-Status, die funktionale Updates ermöglicht.
     */
    setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
    /**
     * @en Function to draft an email body based on subject and attachments.
     * @de Funktion zum Entwerfen eines E-Mail-Textes basierend auf Betreff und Anhängen.
     */
    onDraftBody: (subject: string, attachments: (Document | GeneratedDocument)[]) => Promise<string>;
    /**
     * @en Callback to confirm and log the dispatch.
     * @de Callback zur Bestätigung und Protokollierung des Versands.
     */
    onConfirmDispatch: () => void;
    isLoading: boolean;
    loadingSection: string;
    setActiveTab: (tab: ActiveTab) => void;
    documents: Document[];
    generatedDocuments: GeneratedDocument[];
    /**
     * @en The content of the cover letter or email body.
     * @de Der Inhalt des Anschreibens oder E-Mail-Textes.
     */
    coverLetter: string;
    /**
     * @en Function to update the cover letter content.
     * @de Funktion zur Aktualisierung des Inhalts des Anschreibens.
     */
    setCoverLetter: (value: string) => void;
}

/**
 * @en A tab for preparing and dispatching documents. It includes an email composer,
 *     attachment management, and a pre-flight checklist.
 * @de Ein Tab zur Vorbereitung und zum Versand von Dokumenten. Er enthält einen E-Mail-Editor,
 *     Anhangsverwaltung und eine Pre-Flight-Checkliste.
 * @param props - The component props.
 * @returns A React functional component.
 */
const DispatchTab: React.FC<DispatchTabProps> = ({
    dispatchDocument, checklist, setChecklist, onDraftBody, onConfirmDispatch, 
    isLoading, loadingSection, setActiveTab, documents, generatedDocuments,
    coverLetter, setCoverLetter
}) => {
    const [email, setEmail] = useState({ recipient: '', subject: '' });
    const [selectedAttachments, setSelectedAttachments] = useState<string[]>(dispatchDocument ? [dispatchDocument.id] : []);

    const allAttachableDocs = [
        ...generatedDocuments.map(d => ({ ...d, type: 'generated' })), 
        ...documents.map(d => ({ id: d.id, title: d.name, type: 'uploaded' }))
    ];

    /**
     * @en Toggles the selection of an attachment.
     * @de Schaltet die Auswahl eines Anhangs um.
     * @param id - The ID of the document or generated document.
     */
    const handleToggleAttachment = (id: string) => {
        setSelectedAttachments(prev => prev.includes(id) ? prev.filter(attId => attId !== id) : [...prev, id]);
    };
    
    /**
     * @en Toggles the checked state of a checklist item.
     * @de Schaltet den "checked"-Status eines Checklisten-Elements um.
     * @param id - The ID of the checklist item.
     */
    const handleChecklistToggle = (id: string) => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    /**
     * @en Triggers the AI to draft an email body based on the subject and selected attachments.
     * @de Löst die KI aus, um einen E-Mail-Text basierend auf dem Betreff und den ausgewählten Anhängen zu entwerfen.
     */
    const handleDraftEmailBody = async () => {
        // Reconstruct attachments from original sources to avoid type errors.
        const attachedGenerated = generatedDocuments.filter(d => selectedAttachments.includes(d.id));
        const attachedDocs = documents.filter(d => selectedAttachments.includes(d.id));
        const attachments = [...attachedGenerated, ...attachedDocs];
        const draftBody = await onDraftBody(email.subject, attachments);
        setCoverLetter(draftBody);
    };

    if (!dispatchDocument && selectedAttachments.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-gray-500">No document selected for dispatch. / Kein Dokument für den Versand ausgewählt.</p>
                <button onClick={() => setActiveTab('generation')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
                    Go to Document Generation / Zur Dokumentengenerierung
                </button>
            </div>
        );
    }
    
    const isChecklistComplete = checklist.every(item => item.checked);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dispatch Preparation / Versandvorbereitung</h1>
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Email and Attachments */}
                <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-white">Communication / Kommunikation</h3>
                    <div>
                        <label className="text-sm text-gray-400">Recipient / Empfänger</label>
                        <input type="email" placeholder="recipient@example.com / empfaenger@example.com" value={email.recipient} onChange={e => setEmail({...email, recipient: e.target.value})} className="w-full mt-1 bg-gray-700 p-2 rounded-md" />
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Subject / Betreff</label>
                        <input type="text" placeholder="Subject of the email / Betreff der E-Mail" value={email.subject} onChange={e => setEmail({...email, subject: e.target.value})} className="w-full mt-1 bg-gray-700 p-2 rounded-md" />
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                             <label className="text-sm text-gray-400">Body / Textkörper</label>
                             <button onClick={handleDraftEmailBody} disabled={isLoading && loadingSection === 'dispatch-body'} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs disabled:bg-gray-500">
                                {isLoading && loadingSection === 'dispatch-body' ? '...' : 'Draft with AI / Entwurf erstellen'}
                             </button>
                        </div>
                        <textarea 
                            value={coverLetter}
                            onChange={e => setCoverLetter(e.target.value)}
                            rows={10}
                            className="w-full bg-gray-700 p-2 rounded-md"
                            placeholder="Insert or generate email body here... / Hier E-Mail-Text einfügen oder generieren..."
                        />
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Attachments / Anhänge</label>
                        <div className="w-full mt-1 bg-gray-700 p-2 rounded-md max-h-48 overflow-y-auto space-y-2">
                           {allAttachableDocs.map(doc => (
                               <label key={doc.id} className="flex items-center space-x-2 text-sm text-gray-200 cursor-pointer">
                                    <input type="checkbox" checked={selectedAttachments.includes(doc.id)} onChange={() => handleToggleAttachment(doc.id)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500"/>
                                    <span>{doc.title} <span className="text-xs text-gray-500">({doc.type === 'generated' ? 'Generated / Generiert' : 'Uploaded / Hochgeladen'})</span></span>
                               </label>
                           ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Checklist & Confirmation */}
                <div className="bg-gray-800 p-6 rounded-lg space-y-4 flex flex-col">
                    <h3 className="text-lg font-semibold text-white">Dispatch Checklist / Versand-Checkliste</h3>
                    <div className="space-y-3">
                        {checklist.map(item => (
                            <label key={item.id} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => handleChecklistToggle(item.id)}
                                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`text-gray-300 ${item.checked ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex-grow flex items-end justify-center">
                        <button 
                            onClick={onConfirmDispatch}
                            disabled={!isChecklistComplete || selectedAttachments.length === 0}
                            className="w-full px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-500 transition-colors"
                            title={!isChecklistComplete ? "Please complete all checklist items. / Bitte alle Punkte der Checkliste abschließen." : "Log dispatch / Versand protokollieren"}
                        >
                            Confirm & Log Dispatch / Versand bestätigen & protokollieren
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DispatchTab;