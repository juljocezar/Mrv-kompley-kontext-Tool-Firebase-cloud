import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge, Position, OnNodeClick, OnEdgeClick } from '@xyflow/react';
import { Type } from '@google/genai';
import type { CaseEntity, Document, AppSettings, EntityRelationship } from '../../types';
import { callGeminiAPIThrottled } from '../../services/geminiService';
import { addRelationshipToEntity } from '../../services/firebaseService'; // Assuming we need the user ID
import { auth } from '../../services/firebaseService';
import { MRV_AGENTS } from '../../constants';

import DetailSidebar from '../ui/DetailSidebar';

import '@xyflow/react/dist/style.css';

interface GraphTabProps {
    entities: CaseEntity[];
    documents: Document[];
    caseDescription: string;
    settings: AppSettings;
    logAgentAction: (agentName: string, action: string, result: 'erfolg' | 'fehler') => Promise<void>;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    setLoadingSection: (section: string) => void;
}

interface AISuggestedRelationship {
    sourceEntityId: string;
    targetEntityId: string;
    relationshipType: string;
    description: string;
    confidenceScore: number;
    evidence: string;
}

const GraphTab: React.FC<GraphTabProps> = ({
    entities,
    documents,
    caseDescription,
    settings,
    logAgentAction,
    isLoading,
    setIsLoading,
    setLoadingSection
}) => {
    const nodeSize = { width: 170, height: 60 };
    const [suggestedEdges, setSuggestedEdges] = useState<Edge[]>([]);
    const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);

    const handleNodeClick: OnNodeClick = useCallback((event, node) => {
        setSelectedElement(node);
    }, []);

    const handleEdgeClick: OnEdgeClick = useCallback((event, edge) => {
        setSelectedElement(edge);
    }, []);

    const handleConfirmEdge = useCallback(async (edge: Edge) => {
        const user = auth.currentUser;
        if (!user) {
            alert("Sie müssen angemeldet sein, um diese Aktion durchzuführen.");
            return;
        }
        
        const sourceEntity = entities.find(e => e.id === edge.source);
        const targetEntity = entities.find(e => e.id === edge.target);

        if (!sourceEntity || !targetEntity) {
            alert("Quell- oder Ziel-Entität nicht gefunden.");
            return;
        }

        const newRelationship: EntityRelationship = {
            targetEntityId: edge.target,
            targetEntityName: targetEntity.name,
            description: edge.label as string,
        };

        try {
            await addRelationshipToEntity(user.uid, edge.source, newRelationship);
            // After successful confirmation, remove it from the suggested list
            setSuggestedEdges(prev => prev.filter(e => e.id !== edge.id));
            setSelectedElement(null); // Close sidebar
            await logAgentAction("Benutzer", `KI-Vorschlag bestätigt: ${sourceEntity.name} -> ${targetEntity.name}`, 'erfolg');
        } catch (error) {
            console.error("Fehler beim Bestätigen der Beziehung:", error);
            alert("Fehler beim Speichern der Beziehung.");
        }

    }, [entities, logAgentAction]);

    const handleRejectEdge = useCallback(async (edgeId: string) => {
        setSuggestedEdges(prev => prev.filter(e => e.id !== edgeId));
        setSelectedElement(null); // Close sidebar
        await logAgentAction("Benutzer", `KI-Vorschlag abgelehnt: Kante ${edgeId}`, 'erfolg');
    }, [logAgentAction]);

    const handleAnalyzeRelationships = useCallback(async () => {
        // ... (rest of the function remains the same)
        if (entities.length < 2) {
            alert("Es müssen mindestens zwei Entitäten vorhanden sein, um Beziehungen zu analysieren.");
            return;
        }

        setIsLoading(true);
        setLoadingSection('graph-analysis');
        const agent = MRV_AGENTS.relationshipAnalyst;
        await logAgentAction(agent.name, "Start der Beziehungsanalyse", 'erfolg');

        try {
            const entityList = entities.map(e => `ID: ${e.id}, Name: ${e.name}, Typ: ${e.type}`).join('\n');
            const documentSummaries = documents.map(d => `Dokument: ${d.name}\nInhalt (Auszug):\n${d.content.substring(0, 500)}...`).join('\n\n');

            const prompt = `
            Aufgabenstellung: Analysiere die Beziehungen zwischen den unten aufgeführten Entitäten basierend auf der Fallbeschreibung und den Dokumentenauszügen.
            Fallbeschreibung: ${caseDescription}
            Entitäten:\n${entityList}
            Dokumente (Auszüge):\n${documentSummaries}
            Anweisungen:
            1. Identifiziere alle plausiblen Beziehungen.
            2. Gib für jede Beziehung eine Beschreibung, einen Typ (Finanziell, Kommunikation, Rechtlich, Familiär, Beruflich, Sozial, Besitz, Unbekannt), eine Begründung/Beweis und eine Zuversicht (0.1-1.0).
            3. Gib das Ergebnis ausschließlich als JSON-Objekt zurück.
            `;

            const schema = {
                type: Type.OBJECT,
                properties: {
                    relationships: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                sourceEntityId: { type: Type.STRING },
                                targetEntityId: { type: Type.STRING },
                                relationshipType: { type: Type.STRING },
                                description: { type: Type.STRING },
                                confidenceScore: { type: Type.NUMBER },
                                evidence: { type: Type.STRING }
                            },
                            required: ["sourceEntityId", "targetEntityId", "relationshipType", "description", "confidenceScore", "evidence"]
                        }
                    }
                },
                required: ["relationships"]
            };

            const resultJson = await callGeminiAPIThrottled(prompt, schema, settings.ai);
            const result: { relationships: AISuggestedRelationship[] } = JSON.parse(resultJson);

            const newEdges = result.relationships.map(rel => ({
                id: `ai-${rel.sourceEntityId}-${rel.targetEntityId}-${Math.random()}`,
                source: rel.sourceEntityId,
                target: rel.targetEntityId,
                label: `${rel.description} (${rel.relationshipType})`,
                data: {
                    type: 'ai-suggested',
                    details: rel.evidence,
                    confidence: rel.confidenceScore
                },
                animated: true,
                style: { stroke: '#ff007f', strokeWidth: 2 },
                markerEnd: { type: 'arrowclosed', color: '#ff007f' }
            }));

            setSuggestedEdges(newEdges);
            await logAgentAction(agent.name, `Analyse abgeschlossen, ${newEdges.length} Beziehungen gefunden.`, 'erfolg');

        } catch (error) {
            console.error("Fehler bei der Beziehungsanalyse:", error);
            await logAgentAction(agent.name, "Fehler bei der Beziehungsanalyse.", 'fehler');
            alert("Die KI-Analyse ist fehlgeschlagen.");
        } finally {
            setIsLoading(false);
            setLoadingSection('');
        }
    }, [entities, documents, caseDescription, settings, setIsLoading, setLoadingSection, logAgentAction]);

    const { nodes, edges } = useMemo(() => {
        // ... (logic remains the same)
        const allEntities = [...entities];
        const nodeMap = new Map(allEntities.map(e => [e.id, e]));

        const entitiesToDisplay = [...nodeMap.values()];

        const count = entitiesToDisplay.length;
        const center = { x: 400, y: 300 };
        const radius = Math.max(100, 50 * count);

        const reactFlowNodes: Node[] = entitiesToDisplay.map((entity, i) => {
            const angle = (i / count) * 2 * Math.PI;
            return {
                id: entity.id,
                type: 'default',
                position: {
                    x: center.x + radius * Math.cos(angle) - nodeSize.width / 2,
                    y: center.y + radius * Math.sin(angle) - nodeSize.height / 2,
                },
                data: { label: `${entity.name}\n(${entity.type})` },
                style: {
                    width: nodeSize.width,
                    height: nodeSize.height,
                    textAlign: 'center',
                    backgroundColor: '#1f2937',
                    color: '#f3f4f6',
                    border: '1px solid #4f46e5',
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            };
        });

        const manualEdges: Edge[] = [];
        entities.forEach(entity => {
            if (entity.relationships) {
                entity.relationships.forEach(rel => {
                    if (nodeMap.has(entity.id) && nodeMap.has(rel.targetEntityId)) {
                        manualEdges.push({
                            id: `m-${entity.id}-${rel.targetEntityId}`,
                            source: entity.id,
                            target: rel.targetEntityId,
                            label: rel.description,
                            style: { stroke: '#4f46e5', strokeWidth: 2 },
                            markerEnd: { type: 'arrowclosed', color: '#4f46e5' },
                        });
                    }
                });
            }
        });

        return { nodes: reactFlowNodes, edges: [...manualEdges, ...suggestedEdges] };
    }, [entities, suggestedEdges]);

    if (entities.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-gray-500">Keine Entitäten vorhanden.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Beziehungs-Graph</h1>
                    <p className="text-gray-400 mt-1">Klicken Sie auf Knoten oder Kanten für Details.</p>
                </div>
                <button
                    onClick={handleAnalyzeRelationships}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    {isLoading && loadingSection === 'graph-analysis' ? 'Analysiere...' : 'Beziehungen mit KI analysieren'}
                </button>
            </div>

            <div className="w-full h-[600px] bg-gray-900/50 rounded-lg border border-gray-700" data-testid="graph-container">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    onPaneClick={() => setSelectedElement(null)}
                    fitView
                >
                    <Controls />
                    <MiniMap nodeStrokeWidth={3} zoomable pannable />
                    <Background color="#4a5568" gap={16} />
                </ReactFlow>
                <DetailSidebar
                    selectedElement={selectedElement}
                    onClose={() => setSelectedElement(null)}
                    onConfirmEdge={handleConfirmEdge}
                    onRejectEdge={handleRejectEdge}
                />
            </div>
        </div>
    );
};

export default GraphTab;