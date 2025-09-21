import React from 'react';
import { Node, Edge } from '@xyflow/react';

interface DetailSidebarProps {
    selectedElement: Node | Edge | null;
    onConfirmEdge?: (edge: Edge) => void;
    onRejectEdge?: (edgeId: string) => void;
    onClose: () => void;
}

const DetailSidebar: React.FC<DetailSidebarProps> = ({ selectedElement, onConfirmEdge, onRejectEdge, onClose }) => {
    if (!selectedElement) {
        return null;
    }

    const isNode = 'position' in selectedElement;
    const isEdge = 'source' in selectedElement;
    const isAISuggested = isEdge && selectedElement.data?.type === 'ai-suggested';

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-gray-800 border-l border-gray-700 p-4 z-10 text-white overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                    {isNode ? 'Entitätsdetails' : 'Beziehungsdetails'}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </div>

            <div className="space-y-3">
                {isNode && (
                    <div>
                        <p className="font-semibold">Name:</p>
                        <p className="text-gray-300">{selectedElement.data.label}</p>
                    </div>
                )}
                {isEdge && (
                    <>
                        <div>
                            <p className="font-semibold">Beschreibung:</p>
                            <p className="text-gray-300">{selectedElement.label}</p>
                        </div>
                        {isAISuggested && (
                             <>
                                <div>
                                    <p className="font-semibold">KI-Konfidenz:</p>
                                    <p className="text-indigo-300">{Math.round(selectedElement.data.confidence * 100)}%</p>
                                </div>
                                <div>
                                    <p className="font-semibold">KI-Begründung (Beweis):</p>
                                    <p className="text-gray-300 text-sm italic">"{selectedElement.data.details}"</p>
                                </div>
                                <div className="pt-4 space-y-2">
                                    <p className="text-sm text-gray-400">Ist dieser KI-Vorschlag korrekt?</p>
                                    <button
                                        onClick={() => onConfirmEdge && onConfirmEdge(selectedElement as Edge)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Bestätigen
                                    </button>
                                    <button
                                        onClick={() => onRejectEdge && onRejectEdge(selectedElement.id)}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Ablehnen
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DetailSidebar;
