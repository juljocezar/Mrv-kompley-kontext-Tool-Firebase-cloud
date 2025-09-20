import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import type { AppState, CaseContext, Risks, AppSettings, Document } from '../types';

// TODO: Ersetzen Sie dies durch Ihre tatsächliche Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase using v8 compat syntax
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();

// Use Emulators in development
if (window.location.hostname === "localhost") {
  // auth.useEmulator("http://localhost:9099");
  // db.useEmulator("localhost", 8080);
}

// --- Generic Firestore Functions ---

const getCollectionRef = (userId: string, collectionName: string) => {
    return db.collection('users').doc(userId).collection(collectionName);
}

const getCaseDataRef = (userId: string) => {
    return db.collection('users').doc(userId).collection('caseData').doc('main');
}

export const subscribeToCollection = <T>(userId: string, collectionName: string, setData: (data: T[]) => void): (() => void) => {
    const query = getCollectionRef(userId, collectionName);
    const unsubscribe = query.onSnapshot((querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
        setData(data);
    }, (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
    });
    return unsubscribe;
};

export const subscribeToCaseData = (userId: string, setData: (data: Partial<AppState> | null) => void): (() => void) => {
     const unsubscribe = getCaseDataRef(userId).onSnapshot((doc) => {
        if(doc.exists) {
            setData(doc.data() as Partial<AppState>);
        } else {
            setData(null);
        }
    }, (error) => {
        console.error(`Error subscribing to caseData:`, error);
    });
    return unsubscribe;
}

export const addDoc = async <T extends object>(userId: string, collectionName: string, data: T) => {
    return await getCollectionRef(userId, collectionName).add(data);
}

export const updateDoc = async (userId: string, collectionName: string, docId: string, data: any) => {
    const docRef = getCollectionRef(userId, collectionName).doc(docId);
    return await docRef.update(data);
}

export const getDoc = async <T>(userId: string, collectionName: string, docId: string): Promise<T | null> => {
    const docRef = getCollectionRef(userId, collectionName).doc(docId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return { ...docSnap.data(), id: docSnap.id } as T;
    }
    return null;
}

export const deleteDoc = async (userId: string, collectionName: string, docId: string) => {
    const docRef = getCollectionRef(userId, collectionName).doc(docId);
    return await docRef.delete();
}

export const updateCaseData = async (userId: string, data: Partial<{ caseDescription: string, risks: Risks, mitigationStrategies: string, settings: AppSettings }>) => {
    await getCaseDataRef(userId).set(data, { merge: true });
}

export const exportCase = async (userId: string): Promise<string> => {
    const exportData: Partial<AppState> = {};
    const collectionsToExport = ['documents', 'generatedDocuments', 'documentAnalysisResults', 'detailedAnalysisResults', 'agentActivityLog', 'kpis', 'timelineEvents', 'caseEntities', 'knowledgeItems', 'contradictions', 'tags', 'auditLog'];

    const caseDataDocSnap = await getCaseDataRef(userId).get();
    if(caseDataDocSnap.exists) {
      const caseDataDoc = caseDataDocSnap.data() as CaseContext;
      exportData.caseDescription = caseDataDoc.caseDescription;
      exportData.risks = caseDataDoc.risks;
      exportData.mitigationStrategies = caseDataDoc.mitigationStrategies;
    }

    for (const collectionName of collectionsToExport) {
        const query = getCollectionRef(userId, collectionName);
        const querySnapshot = await query.get();
        (exportData as any)[collectionName] = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    }

    return JSON.stringify(exportData, null, 2);
}

export const importCase = async (userId: string, jsonData: string): Promise<void> => {
    const importData: AppState = JSON.parse(jsonData);

    const collectionsToProcess = ['documents', 'generatedDocuments', 'documentAnalysisResults', 'detailedAnalysisResults', 'agentActivityLog', 'kpis', 'timelineEvents', 'caseEntities', 'knowledgeItems', 'contradictions', 'tags', 'auditLog'];
    
    // Clear existing data in batches
    for (const collectionName of collectionsToProcess) {
        const snapshot = await getCollectionRef(userId, collectionName).get();
        const batch = db.batch();
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
    }

    // Import new data
    const caseDataToImport = {
        caseDescription: importData.caseDescription || '',
        risks: importData.risks,
        mitigationStrategies: importData.mitigationStrategies || '',
        settings: importData.settings
    };
    await getCaseDataRef(userId).set(caseDataToImport);

    for (const collectionName of collectionsToProcess) {
        const dataToImport = (importData as any)[collectionName];
        if (dataToImport && Array.isArray(dataToImport)) {
             const batch = db.batch();
             dataToImport.forEach(item => {
                 const { id, ...data } = item;
                 const docRef = id ? getCollectionRef(userId, collectionName).doc(id) : getCollectionRef(userId, collectionName).doc();
                 batch.set(docRef, data);
             });
             await batch.commit();
        }
    }
}