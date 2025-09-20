import React, { useState, useRef, useEffect } from 'react';
import type { Document, AnalysisChatMessage } from '../../types';

/**
 * @en Props for the AnalysisChatModal component.
 * @de Props für die AnalysisChatModal-Komponente.
 */
interface AnalysisChatModalProps {
    /**
     * @en The document(s) being analyzed.
     * @de Das/die zu analysierende(n) Dokument(e).
     */
    documents: Document[];
    /**
     * @en The history of the chat conversation.
     * @de Der Verlauf des Chat-Gesprächs.
     */
    chatHistory: AnalysisChatMessage[];
    /**
     * @en Callback function to send a new message.
     * @de Callback-Funktion zum Senden einer neuen Nachricht.
     */
    onSendMessage: (message: string) => void;
    /**
     * @en Callback function to close the modal.
     * @de Callback-Funktion zum Schließen des Modals.
     */
    onClose: () => void;
    /**
     * @en Flag indicating if the chat is waiting for a response.
     * @de Flag, das anzeigt, ob der Chat auf eine Antwort wartet.
     */
    isLoading: boolean;
    /**
     * @en Callback function to add a new knowledge item from selected text.
     * @de Callback-Funktion zum Hinzufügen eines neuen Wissenseintrags aus ausgewähltem Text.
     */
    onAddKnowledge: (title: string, summary: string, sourceDocId: string) => void;
}

/**
 * @en A modal component for chatting with an AI about one or more documents.
 *     It allows users to ask questions and create knowledge items from the document text.
 * @de Eine modale Komponente für den Chat mit einer KI über ein oder mehrere Dokumente.
 *     Sie ermöglicht es Benutzern, Fragen zu stellen und Wissenseinträge aus dem Dokumenttext zu erstellen.
 * @param props - The component props.
 * @returns A React functional component.
 */
const AnalysisChatModal: React.FC<AnalysisChatModalProps> = ({ documents, chatHistory, onSendMessage, onClose, isLoading, onAddKnowledge }) => {
    const [message, setMessage] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const isMultiDoc = documents.length > 1;
    const singleDoc = isMultiDoc ? null : documents[0];

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    /**
     * @en Sends the message from the input field.
     * @de Sendet die Nachricht aus dem Eingabefeld.
     */
    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    /**
     * @en Captures the selected text within the chat container.
     * @de Erfasst den ausgewählten Text innerhalb des Chat-Containers.
     */
    const handleMouseUp = () => {
        if (isMultiDoc) return; // Disable for multi-doc chat
        const selection = window.getSelection()?.toString().trim();
        if (selection) {
            setSelectedText(selection);
        } else {
            setSelectedText('');
        }
    };

    /**
     * @en Creates a new knowledge item from the selected text.
     * @de Erstellt einen neuen Wissenseintrag aus dem ausgewählten Text.
     */
    const handleCreateKnowledgeItem = () => {
        if (!selectedText || !singleDoc) return;
        const title = prompt("Title for the new knowledge item: / Titel für den neuen Wissenseintrag:", `Excerpt from ${singleDoc.name} / Auszug aus ${singleDoc.name}`);
        if (title) {
            onAddKnowledge(title, selectedText, singleDoc.id);
            setSelectedText('');
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col border border-gray-700">
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white truncate">Chat Analysis: / Chat-Analyse: <span className="text-blue-400">{isMultiDoc ? `${documents.length} Documents / Dokumente` : documents[0]?.name}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </header>
                <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4" onMouseUp={handleMouseUp}>
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl px-4 py-2 rounded-lg ${chat.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                <p className="whitespace-pre-wrap">{chat.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                             <div className="max-w-xl px-4 py-2 rounded-lg bg-gray-700 text-gray-200">
                                 <div className="flex items-center space-x-2">
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                                 </div>
                             </div>
                         </div>
                    )}
                </div>
                {selectedText && !isMultiDoc && (
                    <div className="p-2 border-t border-gray-700 bg-gray-700/50 flex items-center justify-between">
                        <p className="text-xs text-gray-300 truncate italic mr-4">"{selectedText}"</p>
                        <button onClick={handleCreateKnowledgeItem} className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white text-xs whitespace-nowrap">
                            Save as Knowledge / Als Wissen speichern
                        </button>
                    </div>
                )}
                <footer className="p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Ask a question about the document... / Stellen Sie eine Frage zum Dokument..."
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isLoading ? '...' : 'Send / Senden'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AnalysisChatModal;