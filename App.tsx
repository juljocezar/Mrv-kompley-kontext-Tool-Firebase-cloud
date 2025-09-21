import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Type, Part } from '@google/genai';
import { auth } from './services/firebaseService';
// Fix: Import User type from firebase/auth for v9 compatibility
import type { User } from 'firebase/auth';


import SidebarNav from './components/ui/SidebarNav';
import AssistantSidebar from './components/ui/AssistantSidebar';
import DashboardTab from './components/tabs/DashboardTab';
import DocumentsTab from './components/tabs/DocumentsTab';
import AnalysisTab from './components/tabs/AnalysisTab';
import GenerationTab from './components/tabs/GenerationTab';
import LibraryTab from './components/tabs/LibraryTab';
import ReportsTab from './components/tabs/ReportsTab';
import KpisTab from './components/tabs/KpisTab';
import AgentManagementTab from './components/tabs/AgentManagementTab';
import StrategyTab from './components/tabs/StrategyTab';
import DispatchTab from './components/tabs/DispatchTab';
import ChronologyTab from './components/tabs/ChronologyTab';
import EntitiesTab from './components/tabs/EntitiesTab';
import KnowledgeBaseTab from './components/tabs/KnowledgeBaseTab';
import ContradictionsTab from './components/tabs/ContradictionsTab';
import SettingsTab from './components/tabs/SettingsTab';
import LegalBasisTab from './components/tabs/LegalBasisTab';
import UNSubmissionsTab from './components/tabs/UNSubmissionsTab';
import EthicsAnalysisTab from './components/tabs/EthicsAnalysisTab';
import AuditLogTab from './components/tabs/AuditLogTab';
import GraphTab from './components/tabs/GraphTab';
import FocusModeSwitcher from './components/ui/FocusModeSwitcher';
import AnalysisChatModal from './components/modals/AnalysisChatModal';
import Auth from './components/auth/Auth';

import * as firebaseService from './services/firebaseService';

import { 
    Document, DocumentAnalysis, DocumentAnalysisResults, GeneratedDocument, ActiveTab, 
    AgentActivity, Risks, KPI, TimelineEvent, DetailedAnalysis, DetailedAnalysisResults,
    Insight, ChecklistItem, CaseEntity, KnowledgeItem, Contradiction, DocumentLink, SuggestedEntity,
    SuggestedLink, AppSettings, UNSubmission, EthicsAnalysis, CaseSummary, ChainOfCustodyEvent, AnalysisChatMessage,
    AppState, EntityRelationship, Tag, AuditLogEntry, AgentCapability
} from './types';

import { callGeminiAPIThrottled } from './services/geminiService';
import { extractFileContent } from './utils/fileUtils';
import { hashText } from './utils/cryptoUtils';
import { buildCaseContext } from './utils/contextUtils';
import { selectAgentForTask } from './utils/agentSelection';
import { MRV_AGENTS } from './constants';

/**
 * Hauptkomponente der Anwendung.
 * Verwaltet den gesamten Anwendungszustand, die Benutzerauthentifizierung und die Datenlogik.
 * Dient als zentraler Controller, der die verschiedenen UI-Komponenten (Tabs) rendert und mit Daten versorgt.
 */
const App: React.FC = () => {
    // =================================================================================
    // AUTHENTIFIZIERUNGSZUSTAND (Authentication State)
    // =================================================================================
    // Fix: Use User type from firebase/auth
    const [user, setUser] = useState<User | null>(null); // Der aktuell authentifizierte Firebase-Benutzer. Null, wenn niemand angemeldet ist.
    const [authLoading, setAuthLoading] = useState(true); // Zeigt an, ob der anfängliche Authentifizierungsstatus noch geladen wird.
    
    // =================================================================================
    // GLOBALER ANWENDUNGSZUSTAND (Global Application State)
    // =================================================================================
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard'); // Der aktuell ausgewählte Tab in der UI.
    const [documents, setDocuments] = useState<Document[]>([]); // Liste aller hochgeladenen Dokumente.
    const [documentAnalysisResults, setDocumentAnalysisResults] = useState<DocumentAnalysisResults>({}); // Ergebnisse der Dokumentenanalyse.
    const [detailedAnalysisResults, setDetailedAnalysisResults] = useState<DetailedAnalysisResults>({}); // Ergebnisse der detaillierten Analyse.
    const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]); // Von der KI generierte Dokumente.
    const [caseDescription, setCaseDescription] = useState<string>(''); // Die vom Benutzer eingegebene Fallbeschreibung.
    const [agentActivityLog, setAgentActivityLog] = useState<AgentActivity[]>([]); // Protokoll der Aktionen, die von KI-Agenten ausgeführt werden.
    const [risks, setRisks] = useState<Risks>({ physical: false, legal: false, digital: false, intimidation: false, evidenceManipulation: false, secondaryTrauma: false, burnout: false, psychologicalBurden: false }); // Identifizierte Risiken im Fall.
    const [mitigationStrategies, setMitigationStrategies] = useState<string>(''); // Strategien zur Risikominderung.
    const [kpis, setKpis] = useState<KPI[]>([]); // Key Performance Indicators für den Fall.
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]); // Ereignisse auf der Zeitachse des Falles.
    const [dispatchDocument, setDispatchDocument] = useState<GeneratedDocument | null>(null); // Das für den Versand ausgewählte Dokument.
    const [dispatchCoverLetter, setDispatchCoverLetter] = useState<string>(''); // Anschreiben für den Versand.
    const [dispatchChecklist, setDispatchChecklist] = useState<ChecklistItem[]>([]); // Checkliste für den Versand.
    const [caseEntities, setCaseEntities] = useState<CaseEntity[]>([]); // Im Fall identifizierte Entitäten (Personen, Orte etc.).
    const [suggestedEntities, setSuggestedEntities] = useState<SuggestedEntity[]>([]); // Von der KI vorgeschlagene Entitäten.
    const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]); // Einträge in der Wissensdatenbank.
    const [contradictions, setContradictions] = useState<Contradiction[]>([]); // Gefundene Widersprüche zwischen Dokumenten.
    const [insights, setInsights] = useState<Insight[]>([]); // Von der KI generierte Einblicke.
    const [pinnedInsights, setPinnedInsights] = useState<Insight[]>([]); // Vom Benutzer angepinnte Einblicke.
    const [documentLinks, setDocumentLinks] = useState<DocumentLink[]>([]); // Verknüpfungen zwischen Dokumenten.
    const [suggestedLinks, setSuggestedLinks] = useState<SuggestedLink[]>([]); // Von der KI vorgeschlagene Verknüpfungen.
    const [unSubmissions, setUnSubmissions] = useState<UNSubmission[]>([]); // Entwürfe für UN-Einreichungen.
    const [ethicsAnalysis, setEthicsAnalysis] = useState<EthicsAnalysis | null>(null); // Ergebnis der Ethikanalyse.
    const [caseSummary, setCaseSummary] = useState<CaseSummary | null>(null); // Zusammenfassung des Falles.
    const [settings, setSettings] = useState<AppSettings>({ ai: { temperature: 0.3, topP: 0.95 }, complexity: { low: 5, medium: 15 }}); // Anwendungeinstellungen.
    const [tags, setTags] = useState<Tag[]>([]); // Liste aller verfügbaren Tags zur Klassifizierung.
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]); // Protokoll aller Benutzeraktionen.

    // UI-Zustand
    const [isLoading, setIsLoading] = useState(false); // Zeigt an, ob eine globale Ladeaktion aktiv ist.
    const [loadingSection, setLoadingSection] = useState(''); // Gibt an, welcher Bereich der App gerade lädt.
    const [isFocusMode, setIsFocusMode] = useState(false); // Steuert den Fokusmodus (blendet Seitenleisten aus).

    // Modal-Zustand
    const [chatDocuments, setChatDocuments] = useState<Document[]>([]); // Dokumente, die im Analyse-Chat-Fenster verwendet werden.
    const [chatHistory, setChatHistory] = useState<AnalysisChatMessage[]>([]); // Verlauf des aktuellen Chats.

    /**
     * Bündelt den gesamten Anwendungszustand in einem einzigen Objekt.
     * `useMemo` wird verwendet, um zu verhindern, dass dieses Objekt bei jeder Neuberechnung der Komponente neu erstellt wird,
     * was die Performance verbessert, indem unnötige Neudarstellungen von Kindkomponenten vermieden werden.
     */
    const appState: AppState = useMemo(() => ({
        documents, documentAnalysisResults, detailedAnalysisResults, generatedDocuments, caseDescription,
        agentActivityLog, risks, mitigationStrategies, kpis, timelineEvents,
        dispatchDocument, dispatchCoverLetter, dispatchChecklist, caseEntities, suggestedEntities, knowledgeItems,
        contradictions, unSubmissions, ethicsAnalysis, caseSummary, settings, auditLog,
        insights, pinnedInsights, documentLinks, suggestedLinks, tags
    }), [
        documents, documentAnalysisResults, detailedAnalysisResults, generatedDocuments, caseDescription,
        agentActivityLog, risks, mitigationStrategies, kpis, timelineEvents,
        dispatchDocument, dispatchCoverLetter, dispatchChecklist, caseEntities, suggestedEntities, knowledgeItems,
        contradictions, unSubmissions, ethicsAnalysis, caseSummary, settings, auditLog,
        insights, pinnedInsights, documentLinks, suggestedLinks, tags
    ]);
    
    // =================================================================================
    // EFFEKTE (EFFECTS)
    // =================================================================================

    /**
     * `useEffect` für die Firebase-Authentifizierung.
     * Dieser Hook wird nur einmal beim Mounten der Komponente ausgeführt.
     * Er richtet einen Listener ein, der auf Änderungen des Authentifizierungsstatus reagiert (Anmelden, Abmelden).
     * Der Listener aktualisiert den `user`-Zustand und beendet den Ladezustand.
     * Die `unsubscribe`-Funktion wird beim Unmounten der Komponente aufgerufen, um Memory-Leaks zu verhindern.
     */
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    /**
     * `useEffect` für die Datensynchronisation mit Firebase Firestore.
     * Dieser Hook wird immer dann ausgeführt, wenn sich das `user`-Objekt ändert.
     *
     * Wenn ein Benutzer angemeldet ist (`user` ist nicht null):
     * - Erstellt er Echtzeit-Listener für alle relevanten Firestore-Collections (z.B. 'documents', 'tags').
     * - Die Daten aus Firestore werden verwendet, um den lokalen Anwendungszustand zu aktualisieren.
     * - Er abonniert auch die allgemeinen Falldaten.
     *
     * Wenn kein Benutzer angemeldet ist (`user` ist null):
     * - Setzt er den gesamten Anwendungszustand auf die Anfangswerte zurück.
     *
     * Die zurückgegebene Cleanup-Funktion beendet alle Listener, wenn der Benutzer sich abmeldet oder die Komponente unmounted wird.
     * Dies ist entscheidend, um Datenlecks und unnötige Hintergrundprozesse zu vermeiden.
     */
    useEffect(() => {
        if (!user) {
            // Setzt den gesamten Zustand zurück, wenn der Benutzer sich abmeldet.
            setDocuments([]);
            setDocumentAnalysisResults({});
            setDetailedAnalysisResults({});
            setGeneratedDocuments([]);
            setCaseDescription('');
            setAgentActivityLog([]);
            setRisks({ physical: false, legal: false, digital: false, intimidation: false, evidenceManipulation: false, secondaryTrauma: false, burnout: false, psychologicalBurden: false });
            setMitigationStrategies('');
            setKpis([]);
            setTimelineEvents([]);
            setDispatchDocument(null);
            setDispatchCoverLetter('');
            setDispatchChecklist([]);
            setCaseEntities([]);
            setSuggestedEntities([]);
            setKnowledgeItems([]);
            setContradictions([]);
            setInsights([]);
            setPinnedInsights([]);
            setDocumentLinks([]);
            setSuggestedLinks([]);
            setUnSubmissions([]);
            setEthicsAnalysis(null);
            setCaseSummary(null);
            setSettings({ ai: { temperature: 0.3, topP: 0.95 }, complexity: { low: 5, medium: 15 }});
            setTags([]);
            setAuditLog([]);
            return;
        };

        // Array zum Speichern der Unsubscribe-Funktionen für die Listener.
        const unsubs: (() => void)[] = [];

        // Definiert die Zuordnung von Collection-Namen zu den entsprechenden State-Settern.
        const collections: {[key: string]: React.Dispatch<React.SetStateAction<any>>} = {
            documents: setDocuments,
            generatedDocuments: setGeneratedDocuments,
            documentAnalysisResults: setDocumentAnalysisResults,
            detailedAnalysisResults: setDetailedAnalysisResults,
            agentActivityLog: setAgentActivityLog,
            kpis: setKpis,
            timelineEvents: setTimelineEvents,
            caseEntities: setCaseEntities,
            knowledgeItems: setKnowledgeItems,
            contradictions: setContradictions,
            tags: setTags,
            auditLog: setAuditLog,
            insights: setInsights,
            pinnedInsights: setPinnedInsights,
            documentLinks: setDocumentLinks,
            suggestedLinks: setSuggestedLinks,
            unSubmissions: setUnSubmissions,
            suggestedEntities: setSuggestedEntities,
        };

        // Richtet für jede Collection einen Listener ein.
        for (const [collectionName, setter] of Object.entries(collections)) {
            unsubs.push(firebaseService.subscribeToCollection(user.uid, collectionName, setter));
        }

        // Richtet einen separaten Listener für die allgemeinen Falldaten ein.
        const unsubCaseData = firebaseService.subscribeToCaseData(user.uid, (data) => {
            if (data) {
                setCaseDescription(data.caseDescription || '');
                setRisks(data.risks || { physical: false, legal: false, digital: false, intimidation: false, evidenceManipulation: false, secondaryTrauma: false, burnout: false, psychologicalBurden: false });
                setMitigationStrategies(data.mitigationStrategies || '');
                setSettings(data.settings || { ai: { temperature: 0.3, topP: 0.95 }, complexity: { low: 5, medium: 15 }});
                setCaseSummary(data.caseSummary || null);
                setEthicsAnalysis(data.ethicsAnalysis || null);
            }
        });
        unsubs.push(unsubCaseData);

        // Cleanup-Funktion: Wird beim Unmounten aufgerufen, um alle Listener zu beenden.
        return () => unsubs.forEach(unsub => unsub());

    }, [user]);

    // =================================================================================
    // HANDLER & LOGIK (Handlers & Logic)
    // =================================================================================

    /**
     * Protokolliert eine vom Benutzer ausgeführte Aktion im Audit-Log.
     * @param {string} action - Die Art der Aktion (z.B. "Tag erstellt").
     * @param {string} details - Details zur Aktion.
     */
    const logUserAction = useCallback(async (action: string, details: string) => {
        if (!user) return;
        const entry: Omit<AuditLogEntry, 'id'> = { timestamp: new Date().toISOString(), action, details };
        await firebaseService.addDoc(user.uid, 'auditLog', entry);
    }, [user]);

    /**
     * Protokolliert eine von einem KI-Agenten ausgeführte Aktion.
     * @param {string} agentName - Der Name des Agenten.
     * @param {string} action - Die vom Agenten durchgeführte Aktion.
     * @param {'erfolg' | 'fehler'} result - Das Ergebnis der Aktion.
     */
    const logAgentAction = useCallback(async (agentName: string, action: string, result: 'erfolg' | 'fehler') => {
        if (!user) return;
        const entry: Omit<AgentActivity, 'id'> = { timestamp: new Date().toISOString(), agentName, action, result };
        await firebaseService.addDoc(user.uid, 'agentActivityLog', entry);
    }, [user]);

    /**
     * Erstellt einen neuen Tag und speichert ihn in Firestore.
     * @param {string} name - Der Name des neuen Tags.
     */
    const handleCreateTag = useCallback(async (name: string) => {
        if (!user) return;
        if (name.trim() === '' || tags.some(t => t.name.toLowerCase() === name.trim().toLowerCase())) {
            alert("Tag-Name darf nicht leer sein oder bereits existieren.");
            return;
        }
        const newTag: Omit<Tag, 'id'> = { name: name.trim() };
        await firebaseService.addDoc(user.uid, 'tags', newTag);
        logUserAction("Tag erstellt", `Name: ${name.trim()}`);
    }, [tags, user, logUserAction]);
    
    /**
     * Löscht einen Tag aus Firestore und entfernt ihn aus allen zugehörigen Dokumenten und Wissenseinträgen.
     * @param {string} tagId - Die ID des zu löschenden Tags.
     */
    const handleDeleteTag = useCallback(async (tagId: string) => {
        if (!user) return;
        const tagToDelete = tags.find(t => t.id === tagId);
        if (!tagToDelete) return;

        // Lösche den Tag selbst
        await firebaseService.deleteDoc(user.uid, 'tags', tagId);
        
        // Entferne den Tag aus allen Dokumenten, die ihn verwenden
        const docsToUpdate = documents.filter(doc => doc.tags.includes(tagToDelete.name));
        for (const doc of docsToUpdate) {
            const newTags = doc.tags.filter(t => t !== tagToDelete.name);
            await firebaseService.updateDoc(user.uid, 'documents', doc.id, { tags: newTags });
        }
        // Entferne den Tag aus allen Wissenseinträgen, die ihn verwenden
        const itemsToUpdate = knowledgeItems.filter(item => item.tags.includes(tagToDelete.name));
        for (const item of itemsToUpdate) {
            const newTags = item.tags.filter(t => t !== tagToDelete.name);
            await firebaseService.updateDoc(user.uid, 'knowledgeItems', item.id, { tags: newTags });
        }
        logUserAction("Tag gelöscht", `Name: ${tagToDelete.name}`);
    }, [user, tags, documents, knowledgeItems, logUserAction]);

    /**
     * Aktualisiert die Tags für ein bestimmtes Dokument.
     * @param {string} docId - Die ID des Dokuments.
     * @param {string[]} newTags - Das neue Array von Tag-Namen.
     */
    const handleUpdateDocumentTags = useCallback(async (docId: string, newTags: string[]) => {
        if (!user) return;
        await firebaseService.updateDoc(user.uid, 'documents', docId, { tags: newTags.sort() });
    }, [user]);

    /**
     * Aktualisiert die Tags für einen bestimmten Wissenseintrag.
     * @param {string} itemId - Die ID des Wissenseintrags.
     * @param {string[]} newTags - Das neue Array von Tag-Namen.
     */
    const handleUpdateKnowledgeItemTags = useCallback(async (itemId: string, newTags: string[]) => {
        if (!user) return;
        await firebaseService.updateDoc(user.uid, 'knowledgeItems', itemId, { tags: newTags.sort() });
    }, [user]);
    
    /**
     * Startet den Prozess zur automatischen Klassifizierung eines Dokuments mit einem KI-Agenten.
     * Der Agent weist eine Arbeitskategorie zu und schlägt Tags vor.
     * @param {string} docId - Die ID des zu klassifizierenden Dokuments.
     */
    const handleAutoClassify = useCallback(async (docId: string) => {
        if (!user) return;
        await firebaseService.updateDoc(user.uid, 'documents', docId, { classificationStatus: 'classifying' });
        
        const doc = await firebaseService.getDoc<Document>(user.uid, 'documents', docId);
        if (!doc) return;
        
        const agent = MRV_AGENTS.documentAnalyst;
        try {
            const allTags = tags.map(t => t.name).join(', ');
            const prompt = `Analysiere das folgende Dokument und klassifiziere es.
Dokumenteninhalt:
---
${doc.content.substring(0, 4000)}
---
Aufgaben:
1. Weise eine der folgenden Arbeitskategorien zu: "Korrespondenz", "Beweismittel", "Recherche", "Amtliches Dokument", "Sonstiges".
2. Schlage bis zu 5 relevante Tags aus der folgenden Liste vor. Wenn keine passenden Tags vorhanden sind, schlage neue, sinnvolle Tags vor.
Verfügbare Tags: ${allTags}

Antworte im JSON-Format.`;

            // Definiert das erwartete JSON-Schema für die Antwort der KI.
            const schema = {
                type: Type.OBJECT,
                properties: {
                    workCategory: {
                        type: Type.STRING,
                        description: 'Die zugewiesene Arbeitskategorie (z.B. Korrespondenz, Beweismittel).',
                    },
                    suggestedTags: {
                        type: Type.ARRAY,
                        description: 'Eine Liste von vorgeschlagenen Tags.',
                        items: {
                            type: Type.STRING,
                        },
                    },
                },
                required: ['workCategory', 'suggestedTags'],
            };

            const resultJson = await callGeminiAPIThrottled(prompt, schema, settings.ai);
            const { workCategory, suggestedTags: rawSuggestedTags } = JSON.parse(resultJson);

            const suggestedTags = (rawSuggestedTags || []).map((t: any) => String(t).trim()).filter((t: string) => t);

            // Erstellt neue Tags, falls die KI welche vorschlägt, die noch nicht existieren.
            if (suggestedTags.length > 0) {
                const knownTagNames = new Set(tags.map(t => t.name.toLowerCase()));
                const newTagsToCreate = [...new Set(
                    suggestedTags.filter(t => !knownTagNames.has(t.toLowerCase()))
                )];

                if (newTagsToCreate.length > 0) {
                    logUserAction("Automatische Tag-Erstellung", `Neue Tags: ${newTagsToCreate.join(', ')}`);
                    const creationPromises = newTagsToCreate.map(tagName =>
                        firebaseService.addDoc(user.uid, 'tags', { name: tagName })
                    );
                    await Promise.all(creationPromises);
                }
            }

            // Kombiniert existierende und neue Tags und entfernt Duplikate.
            const currentTags = doc.tags || [];
            const finalTags = [...new Set([...currentTags, ...suggestedTags])].sort();

            await firebaseService.updateDoc(user.uid, 'documents', docId, {
                classificationStatus: 'classified',
                workCategory: workCategory || 'Unbestimmt',
                tags: finalTags
            });
            logAgentAction(agent.name, `Triage für "${doc.name}" erfolgreich`, 'erfolg');
        } catch(e) {
            console.error("Fehler bei der automatischen Klassifizierung:", e);
            await firebaseService.updateDoc(user.uid, 'documents', docId, { classificationStatus: 'failed' });
            logAgentAction(agent.name, `Triage für "${doc.name}"`, 'fehler');
        }
    }, [user, tags, settings.ai, logAgentAction, logUserAction]);

    /**
     * Verarbeitet den Upload von Dateien.
     * Extrahiert den Inhalt (bei Bildern/PDFs per OCR mit Gemini), speichert das Dokument in Firestore
     * und startet den automatischen Klassifizierungsprozess.
     * @param {File[]} files - Ein Array von Dateien, die hochgeladen werden sollen.
     */
    const handleFileUpload = useCallback(async (files: File[]) => {
        if (!user) return;
        setIsLoading(true);
        setLoadingSection('file-upload');
        logUserAction('Dateiupload gestartet', `Anzahl: ${files.length}`);
        
        for (const file of files) {
            try {
                // Extrahiert Text oder Base64-codierte Daten aus der Datei.
                const { text, base64, mimeType } = await extractFileContent(file);
                let content = text ?? '';
                 // Wenn es sich um ein Bild oder PDF handelt, wird OCR mit Gemini durchgeführt.
                 if (base64 && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
                    const agent = selectAgentForTask('information_extraction');
                    const promptParts: Part[] = [
                      { inlineData: { mimeType, data: base64 } },
                      { text: "Extrahiere den gesamten Textinhalt aus diesem Dokument." }
                    ];
                    content = await callGeminiAPIThrottled(promptParts, null, settings.ai);
                    await logAgentAction(agent.name, `OCR für "${file.name}"`, 'erfolg');
                 }
                // Erstellt einen Hash des Inhalts für die Chain of Custody.
                const contentHash = await hashText(content);
                const chainOfCustody: ChainOfCustodyEvent[] = [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), action: 'Created', contentHash }];

                // Erstellt das neue Dokumentobjekt.
                const newDoc: Omit<Document, 'id'> = {
                    name: file.name,
                    type: file.type,
                    content: content,
                    size: file.size,
                    uploadDate: new Date().toISOString(),
                    classificationStatus: 'unclassified',
                    tags: [],
                    workCategory: 'Unbestimmt',
                    chainOfCustody: chainOfCustody,
                };
                const docRef = await firebaseService.addDoc(user.uid, 'documents', newDoc);
                // Startet die automatische Klassifizierung für das neue Dokument.
                handleAutoClassify(docRef.id);
            } catch (error) {
                console.error("Error processing file:", file.name, error);
                logAgentAction('System', `Fehler bei Verarbeitung von "${file.name}"`, 'fehler');
            }
        }
        setIsLoading(false);
    }, [user, logUserAction, settings.ai, logAgentAction, handleAutoClassify]);
    
    /**
     * Öffnet das Analyse-Chat-Modal mit den ausgewählten Dokumenten.
     * @param {Document[]} docs - Die Dokumente, die im Chat-Kontext verfügbar sein sollen.
     */
    const handleOpenChat = (docs: Document[]) => {
        setChatDocuments(docs);
        setChatHistory([]); // Leert den Chat-Verlauf für eine neue Sitzung.
    };
    
    /**
     * Schließt das Analyse-Chat-Modal.
     */
    const handleCloseChat = () => {
        setChatDocuments([]);
    };

    // =================================================================================
    // RENDER-LOGIK (Render Logic)
    // =================================================================================

    /**
     * Rendert die Komponente für den aktuell aktiven Tab.
     * Fungiert als "Router" für den Hauptinhaltsbereich der Anwendung.
     * @returns {React.ReactElement} Die zu rendernde Tab-Komponente.
     */
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardTab documents={documents} generatedDocuments={generatedDocuments} documentAnalysisResults={documentAnalysisResults} caseDescription={caseDescription} setCaseDescription={(desc) => user && firebaseService.updateCaseData(user.uid, { caseDescription: desc })} setActiveTab={setActiveTab} onResetCase={() => {}} onExportCase={() => user && firebaseService.exportCase(user.uid).then(data => { const blob = new Blob([data], {type: 'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `mrv-case-export.json`; a.click(); URL.revokeObjectURL(url); })} onImportCase={(file) => user && file.text().then(text => firebaseService.importCase(user.uid, text))} caseSummary={caseSummary} onPerformOverallAnalysis={() => {}} isLoading={isLoading} loadingSection={loadingSection} />;
            case 'documents': return <DocumentsTab documents={documents} setDocuments={setDocuments} onFileUpload={handleFileUpload} onAnalyzeDocumentWorkload={()=>{}} onOpenChat={handleOpenChat} isLoading={isLoading} loadingSection={loadingSection} tags={tags} onUpdateDocumentTags={handleUpdateDocumentTags} />;
            case 'analysis': return <AnalysisTab documents={documents} documentAnalysisResults={documentAnalysisResults} detailedAnalysisResults={detailedAnalysisResults} onPerformDetailedAnalysis={()=>{}} onAnalyzeCorrespondence={()=>{}} isLoading={isLoading} loadingSection={loadingSection} />;
            case 'generation': return <GenerationTab onGenerateDocument={async(p,t,s) => { if(!user) return ""; const newDoc = { title: t, content: p, createdAt: new Date().toISOString(), status: 'draft', version: 1 } as Omit<GeneratedDocument, 'id'>; await firebaseService.addDoc(user.uid, 'generatedDocuments', newDoc); return "";}} isLoading={isLoading} generatedDocuments={generatedDocuments} setGeneratedDocuments={setGeneratedDocuments} documents={documents} setActiveTab={setActiveTab} onDispatchDocument={setDispatchDocument} />;
            case 'dispatch': return <DispatchTab dispatchDocument={dispatchDocument} checklist={dispatchChecklist} setChecklist={setDispatchChecklist} onDraftBody={async () => ""} onConfirmDispatch={()=>{}} isLoading={isLoading} loadingSection={loadingSection} setActiveTab={setActiveTab} documents={documents} generatedDocuments={generatedDocuments} coverLetter={dispatchCoverLetter} setCoverLetter={setDispatchCoverLetter}/>;
            case 'chronology': return <ChronologyTab timelineEvents={timelineEvents} setTimelineEvents={setTimelineEvents} documents={documents} />;
            case 'entities': return <EntitiesTab entities={caseEntities} setEntities={setCaseEntities} documents={documents} suggestedEntities={suggestedEntities} onAcceptSuggestedEntity={()=>{}} onDismissSuggestedEntity={()=>{}} onAnalyzeRelationships={()=>{}} isLoading={isLoading} loadingSection={loadingSection} />;
            case 'graph': return <GraphTab entities={caseEntities} />;
            case 'knowledge': return <KnowledgeBaseTab knowledgeItems={knowledgeItems} tags={tags} onUpdateKnowledgeItemTags={handleUpdateKnowledgeItemTags} />;
            case 'contradictions': return <ContradictionsTab contradictions={contradictions} documents={documents} onFindContradictions={()=>{}} isLoading={isLoading} />;
            case 'strategy': return <StrategyTab risks={risks} setRisks={(r) => user && firebaseService.updateCaseData(user.uid, { risks: typeof r === 'function' ? r(risks) : r})} mitigationStrategies={mitigationStrategies} onGenerateMitigationStrategies={()=>{}} isLoading={isLoading} />;
            case 'kpis': return <KpisTab kpis={kpis} setKpis={setKpis} onSuggestKpis={()=>{}} isLoading={isLoading} />;
            case 'legal': return <LegalBasisTab />;
            case 'un-submissions': return <UNSubmissionsTab submissions={unSubmissions} setSubmissions={setUnSubmissions} onGenerateSection={async () => ""} onFinalize={async () => {}} isLoading={isLoading} loadingSection={loadingSection} />;
            case 'ethics': return <EthicsAnalysisTab analysisResult={ethicsAnalysis} onPerformAnalysis={()=>{}} isLoading={isLoading} />;
            case 'library': return <LibraryTab />;
            case 'audit': return <AuditLogTab auditLog={auditLog} agentActivityLog={agentActivityLog} />;
            case 'agents': return <AgentManagementTab agentActivityLog={agentActivityLog} />;
            case 'settings': return <SettingsTab settings={settings} setSettings={(s) => user && firebaseService.updateCaseData(user.uid, { settings: typeof s === 'function' ? s(settings) : s})} tags={tags} onCreateTag={handleCreateTag} onDeleteTag={handleDeleteTag} />;
            default: return <DashboardTab documents={documents} generatedDocuments={generatedDocuments} documentAnalysisResults={documentAnalysisResults} caseDescription={caseDescription} setCaseDescription={(desc) => user && firebaseService.updateCaseData(user.uid, { caseDescription: desc })} setActiveTab={setActiveTab} onResetCase={() => {}} onExportCase={() => {}} onImportCase={() => {}} caseSummary={caseSummary} onPerformOverallAnalysis={() => {}} isLoading={isLoading} loadingSection={loadingSection} />;
        }
    };
    
    // Zeigt eine Ladeanzeige an, während der Authentifizierungsstatus überprüft wird.
    if (authLoading) {
        return <div className="flex items-center justify-center h-screen w-screen"><p className="text-white">Authentifizierung wird geladen...</p></div>;
    }

    // Zeigt die Authentifizierungskomponente an, wenn kein Benutzer angemeldet ist.
    if (!user) {
        return <Auth />;
    }

    // Rendert die Hauptanwendungsoberfläche, wenn ein Benutzer angemeldet ist.
    return (
        <div className="bg-gray-900 text-gray-100 flex h-screen font-sans">
            {/* Linke Seitenleiste für die Navigation, im Fokusmodus ausgeblendet */}
            {!isFocusMode && <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />}

            {/* Hauptinhaltsbereich */}
            <main className="flex-grow flex flex-col h-screen">
                <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center flex-shrink-0">
                    <div>{/* Platzhalter für Breadcrumbs oder Kontextinformationen */}</div>
                    <FocusModeSwitcher isFocusMode={isFocusMode} toggleFocusMode={() => setIsFocusMode(!isFocusMode)} />
                </header>
                <div className="flex-grow p-6 overflow-y-auto">
                    {renderActiveTab()}
                </div>
            </main>

            {/* Rechte Seitenleiste für den Assistenten, im Fokusmodus ausgeblendet */}
            {!isFocusMode && <AssistantSidebar agentActivityLog={agentActivityLog} insights={insights} onGenerateInsights={()=>{}} isLoading={isLoading} loadingSection={loadingSection}/>}

            {/* Chat-Modal, wird nur angezeigt, wenn Dokumente für den Chat ausgewählt wurden */}
            {chatDocuments.length > 0 && (
                <AnalysisChatModal 
                    documents={chatDocuments}
                    chatHistory={chatHistory}
                    onSendMessage={() => {}}
                    onClose={handleCloseChat}
                    isLoading={isLoading && loadingSection === 'chat'}
                    onAddKnowledge={() => {}}
                />
            )}
        </div>
    );
};

export default App;
