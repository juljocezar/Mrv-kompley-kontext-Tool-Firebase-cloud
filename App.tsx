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

const App: React.FC = () => {
    // Fix: Use User type from firebase/auth
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    
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

    useEffect(() => {
        if (!user) {
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

        const unsubs: (() => void)[] = [];
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

    const logUserAction = useCallback(async (action: string, details: string) => {
        if (!user) return;
        const entry: Omit<AuditLogEntry, 'id'> = { timestamp: new Date().toISOString(), action, details };
        await firebaseService.addDoc(user.uid, 'auditLog', entry);
    }, [user]);

    const logAgentAction = useCallback(async (agentName: string, action: string, result: 'erfolg' | 'fehler') => {
        if (!user) return;
        const entry: Omit<AgentActivity, 'id'> = { timestamp: new Date().toISOString(), agentName, action, result };
        await firebaseService.addDoc(user.uid, 'agentActivityLog', entry);
    }, [user]);

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
    
    const handleDeleteTag = useCallback(async (tagId: string) => {
        if (!user) return;
        const tagToDelete = tags.find(t => t.id === tagId);
        if (!tagToDelete) return;

        await firebaseService.deleteDoc(user.uid, 'tags', tagId);
        
        const docsToUpdate = documents.filter(doc => doc.tags.includes(tagToDelete.name));
        for (const doc of docsToUpdate) {
            const newTags = doc.tags.filter(t => t !== tagToDelete.name);
            await firebaseService.updateDoc(user.uid, 'documents', doc.id, { tags: newTags });
        }
        const itemsToUpdate = knowledgeItems.filter(item => item.tags.includes(tagToDelete.name));
        for (const item of itemsToUpdate) {
            const newTags = item.tags.filter(t => t !== tagToDelete.name);
            await firebaseService.updateDoc(user.uid, 'knowledgeItems', item.id, { tags: newTags });
        }
        logUserAction("Tag gelöscht", `Name: ${tagToDelete.name}`);
    }, [user, tags, documents, knowledgeItems, logUserAction]);

    const handleUpdateDocumentTags = useCallback(async (docId: string, newTags: string[]) => {
        if (!user) return;
        await firebaseService.updateDoc(user.uid, 'documents', docId, { tags: newTags.sort() });
    }, [user]);

    const handleUpdateKnowledgeItemTags = useCallback(async (itemId: string, newTags: string[]) => {
        if (!user) return;
        await firebaseService.updateDoc(user.uid, 'knowledgeItems', itemId, { tags: newTags.sort() });
    }, [user]);
    
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
            const { workCategory, suggestedTags } = JSON.parse(resultJson);
            const currentTags = doc.tags || [];
            const newTags = [...new Set([...currentTags, ...(suggestedTags || [])])].sort();

            await firebaseService.updateDoc(user.uid, 'documents', docId, {
                classificationStatus: 'classified',
                workCategory: workCategory || 'Unbestimmt',
                tags: newTags
            });
            logAgentAction(agent.name, `Triage für "${doc.name}" erfolgreich`, 'erfolg');
        } catch(e) {
            await firebaseService.updateDoc(user.uid, 'documents', docId, { classificationStatus: 'failed' });
            logAgentAction(agent.name, `Triage für "${doc.name}"`, 'fehler');
        }
    }, [user, tags, settings.ai, logAgentAction]);

    const handleFileUpload = useCallback(async (files: File[]) => {
        if (!user) return;
        setIsLoading(true);
        setLoadingSection('file-upload');
        logUserAction('Dateiupload gestartet', `Anzahl: ${files.length}`);
        
        for (const file of files) {
            try {
                const { text, base64, mimeType } = await extractFileContent(file);
                let content = text ?? '';
                 if (base64 && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
                    const agent = selectAgentForTask('information_extraction');
                    const promptParts: Part[] = [
                      { inlineData: { mimeType, data: base64 } },
                      { text: "Extrahiere den gesamten Textinhalt aus diesem Dokument." }
                    ];
                    content = await callGeminiAPIThrottled(promptParts, null, settings.ai);
                    await logAgentAction(agent.name, `OCR für "${file.name}"`, 'erfolg');
                 }
                const contentHash = await hashText(content);
                const chainOfCustody: ChainOfCustodyEvent[] = [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), action: 'Created', contentHash }];

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
                handleAutoClassify(docRef.id);
            } catch (error) {
                console.error("Error processing file:", file.name, error);
                logAgentAction('System', `Fehler bei Verarbeitung von "${file.name}"`, 'fehler');
            }
        }
        setIsLoading(false);
    }, [user, logUserAction, settings.ai, logAgentAction, handleAutoClassify]);
    
    const handleOpenChat = (docs: Document[]) => {
        setChatDocuments(docs);
        setChatHistory([]); // Clear history for new chat session
    };
    
    const handleCloseChat = () => {
        setChatDocuments([]);
    };

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
    
    if (authLoading) {
        return <div className="flex items-center justify-center h-screen w-screen"><p className="text-white">Authentifizierung wird geladen...</p></div>;
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
