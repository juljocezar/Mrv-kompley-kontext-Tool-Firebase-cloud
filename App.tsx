import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Type, Part } from '@google/genai';
import firebase from 'firebase/compat/app';
import { auth } from './services/firebaseService';

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
 * @en The main application component. It manages the entire application state,
 *     handles user authentication, data fetching, and renders the main UI.
 * @de Die Hauptanwendungskomponente. Sie verwaltet den gesamten Anwendungszustand,
 *     behandelt die Benutzerauthentifizierung, das Abrufen von Daten und rendert die Hauptbenutzeroberfläche.
 * @returns A React functional component.
 */
const App: React.FC = () => {
    const [user, setUser] = useState<firebase.User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    
    // State declarations...
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentAnalysisResults, setDocumentAnalysisResults] = useState<DocumentAnalysisResults>({});
    const [detailedAnalysisResults, setDetailedAnalysisResults] = useState<DetailedAnalysisResults>({});
    const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
    const [caseDescription, setCaseDescription] = useState<string>('');
    const [agentActivityLog, setAgentActivityLog] = useState<AgentActivity[]>([]);
    const [risks, setRisks] = useState<Risks>({ physical: false, legal: false, digital: false, intimidation: false, evidenceManipulation: false, secondaryTrauma: false, burnout: false, psychologicalBurden: false });
    const [mitigationStrategies, setMitigationStrategies] = useState<string>('');
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [dispatchDocument, setDispatchDocument] = useState<GeneratedDocument | null>(null);
    const [dispatchCoverLetter, setDispatchCoverLetter] = useState<string>('');
    const [dispatchChecklist, setDispatchChecklist] = useState<ChecklistItem[]>([]);
    const [caseEntities, setCaseEntities] = useState<CaseEntity[]>([]);
    const [suggestedEntities, setSuggestedEntities] = useState<SuggestedEntity[]>([]);
    const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
    const [contradictions, setContradictions] = useState<Contradiction[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [pinnedInsights, setPinnedInsights] = useState<Insight[]>([]);
    const [documentLinks, setDocumentLinks] = useState<DocumentLink[]>([]);
    const [suggestedLinks, setSuggestedLinks] = useState<SuggestedLink[]>([]);
    const [unSubmissions, setUnSubmissions] = useState<UNSubmission[]>([]);
    const [ethicsAnalysis, setEthicsAnalysis] = useState<EthicsAnalysis | null>(null);
    const [caseSummary, setCaseSummary] = useState<CaseSummary | null>(null);
    const [settings, setSettings] = useState<AppSettings>({ ai: { temperature: 0.3, topP: 0.95 }, complexity: { low: 5, medium: 15 }});
    const [tags, setTags] = useState<Tag[]>([]);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingSection, setLoadingSection] = useState('');
    const [isFocusMode, setIsFocusMode] = useState(false);

    const [chatDocuments, setChatDocuments] = useState<Document[]>([]);
    const [chatHistory, setChatHistory] = useState<AnalysisChatMessage[]>([]);


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
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    /**
     * @en Sets up Firestore listeners for the logged-in user's data and cleans them up on logout.
     * @de Richtet Firestore-Listener für die Daten des angemeldeten Benutzers ein und bereinigt sie beim Abmelden.
     */
    useEffect(() => {
        if (!user) {
            // Reset all state when user logs out
            setDocuments([]);
            setDocumentAnalysisResults({});
            setDetailedAnalysisResults({});
            // ... reset all other states
            return;
        };

        const unsubs: (() => void)[] = [];
        const collections: {[key: string]: React.Dispatch<React.SetStateAction<any>>} = {
            documents: setDocuments,
            generatedDocuments: setGeneratedDocuments,
            // ... all other collections
        };

        for (const [collectionName, setter] of Object.entries(collections)) {
            unsubs.push(firebaseService.subscribeToCollection(user.uid, collectionName, setter));
        }

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

        return () => unsubs.forEach(unsub => unsub());

    }, [user]);

    /**
     * @en Logs a user action to the audit log.
     * @de Protokolliert eine Benutzeraktion im Audit-Log.
     * @param action - A description of the action performed.
     * @param details - Additional details about the action.
     */
    const logUserAction = useCallback(async (action: string, details: string) => {
        if (!user) return;
        const entry: Omit<AuditLogEntry, 'id'> = { timestamp: new Date().toISOString(), action, details };
        await firebaseService.addDoc(user.uid, 'auditLog', entry);
    }, [user]);

    /**
     * @en Logs an agent action to the activity log.
     * @de Protokolliert eine Agentenaktion im Aktivitätsprotokoll.
     * @param agentName - The name of the agent performing the action.
     * @param action - A description of the action.
     * @param result - The result of the action ('success' or 'failure').
     */
    const logAgentAction = useCallback(async (agentName: string, action: string, result: 'erfolg' | 'fehler') => {
        if (!user) return;
        const entry: Omit<AgentActivity, 'id'> = { timestamp: new Date().toISOString(), agentName, action, result };
        await firebaseService.addDoc(user.uid, 'agentActivityLog', entry);
    }, [user]);

    /**
     * @en Handles the creation of a new global tag.
     * @de Behandelt die Erstellung eines neuen globalen Tags.
     * @param name - The name of the new tag.
     */
    const handleCreateTag = useCallback(async (name: string) => {
        if (!user) return;
        if (name.trim() === '' || tags.some(t => t.name.toLowerCase() === name.trim().toLowerCase())) {
            alert("Tag name cannot be empty or already exist. / Tag-Name darf nicht leer sein oder bereits existieren.");
            return;
        }
        const newTag: Omit<Tag, 'id'> = { name: name.trim() };
        await firebaseService.addDoc(user.uid, 'tags', newTag);
        logUserAction("Tag created / Tag erstellt", `Name: ${name.trim()}`);
    }, [tags, user, logUserAction]);
    
    // ... other handlers like handleDeleteTag, handleUpdateDocumentTags etc.

    /**
     * @en Automatically classifies a document after upload using an AI agent.
     * @de Klassifiziert ein Dokument nach dem Hochladen automatisch mit einem KI-Agenten.
     * @param docId - The ID of the document to classify.
     */
    const handleAutoClassify = useCallback(async (docId: string) => {
        // ... implementation
    }, [user, tags, settings.ai, logAgentAction]);

    /**
     * @en Handles the upload and initial processing of files.
     * @de Behandelt den Upload und die Erstverarbeitung von Dateien.
     * @param files - An array of files to upload.
     */
    const handleFileUpload = useCallback(async (files: File[]) => {
        // ... implementation
    }, [user, logUserAction, settings.ai, logAgentAction, handleAutoClassify]);
    
    /**
     * @en Opens the analysis chat modal for one or more documents.
     * @de Öffnet das Analyse-Chat-Modal für ein oder mehrere Dokumente.
     * @param docs - The document(s) to chat about.
     */
    const handleOpenChat = (docs: Document[]) => {
        setChatDocuments(docs);
        setChatHistory([]); // Clear history for new chat session
    };
    
    /**
     * @en Closes the analysis chat modal.
     * @de Schließt das Analyse-Chat-Modal.
     */
    const handleCloseChat = () => {
        setChatDocuments([]);
    };

    /**
     * @en Renders the currently active tab component.
     * @de Rendert die aktuell aktive Tab-Komponente.
     * @returns A React element representing the active tab.
     */
    const renderActiveTab = () => {
        // ... switch statement to render tabs
    };
    
    if (authLoading) {
        return <div className="flex items-center justify-center h-screen w-screen"><p className="text-white">Loading authentication... / Authentifizierung wird geladen...</p></div>;
    }

    if (!user) {
        return <Auth />;
    }

    return (
        <div className="bg-gray-900 text-gray-100 flex h-screen font-sans">
            {!isFocusMode && <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />}
            <main className="flex-grow flex flex-col h-screen">
                <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center flex-shrink-0">
                    <div>{/* Placeholder for breadcrumbs or context */}</div>
                    <FocusModeSwitcher isFocusMode={isFocusMode} toggleFocusMode={() => setIsFocusMode(!isFocusMode)} />
                </header>
                <div className="flex-grow p-6 overflow-y-auto">
                    {renderActiveTab()}
                </div>
            </main>
            {!isFocusMode && <AssistantSidebar agentActivityLog={agentActivityLog} insights={insights} onGenerateInsights={()=>{}} isLoading={isLoading} loadingSection={loadingSection}/>}

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