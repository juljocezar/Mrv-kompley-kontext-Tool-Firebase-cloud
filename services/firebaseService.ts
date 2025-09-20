// Fix: Changed import for initializeApp to a namespace import to resolve a module resolution error.
import * as firebaseApp from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup,
    onAuthStateChanged
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    onSnapshot, 
    addDoc as fbAddDoc, 
    updateDoc as fbUpdateDoc, 
    getDoc as fbGetDoc, 
    deleteDoc as fbDeleteDoc, 
    setDoc, 
    getDocs, 
    writeBatch 
} from 'firebase/firestore';

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

// Fix: Used the firebaseApp namespace to call initializeApp, corresponding to the import change above.
const app = firebaseApp.initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Use Emulators in development
if (window.location.hostname === "localhost") {
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, "localhost", 8080);
}

// --- Generic Firestore Functions ---

const getCollectionRef = (userId: string, collectionName: string) => {
    return collection(db, 'users', userId, collectionName);
}

const getCaseDataRef = (userId: string) => {
    return doc(db, 'users', userId, 'caseData', 'main');
}

export const subscribeToCollection = <T>(userId: string, collectionName: string, setData: (data: T[]) => void): (() => void) => {
    const q = getCollectionRef(userId, collectionName);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
        setData(data);
    }, (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
    });
    return unsubscribe;
};

export const subscribeToCaseData = (userId: string, setData: (data: Partial<AppState> | null) => void): (() => void) => {
     const unsubscribe = onSnapshot(getCaseDataRef(userId), (doc) => {
        if(doc.exists()) {
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
    return await fbAddDoc(getCollectionRef(userId, collectionName), data);
}

export const updateDoc = async (userId: string, collectionName: string, docId: string, data: any) => {
    const docRef = doc(db, 'users', userId, collectionName, docId);
    return await fbUpdateDoc(docRef, data);
}

export const getDoc = async <T>(userId: string, collectionName: string, docId: string): Promise<T | null> => {
    const docRef = doc(db, 'users', userId, collectionName, docId);
    const docSnap = await fbGetDoc(docRef);
    if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as T;
    }
    return null;
}

export const deleteDoc = async (userId: string, collectionName: string, docId: string) => {
    const docRef = doc(db, 'users', userId, collectionName, docId);
    return await fbDeleteDoc(docRef);
}

export const updateCaseData = async (userId: string, data: Partial<{ caseDescription: string, risks: Risks, mitigationStrategies: string, settings: AppSettings }>) => {
    await setDoc(getCaseDataRef(userId), data, { merge: true });
}

export const exportCase = async (userId: string): Promise<string> => {
    const exportData: Partial<AppState> = {};
    const collectionsToExport = ['documents', 'generatedDocuments', 'documentAnalysisResults', 'detailedAnalysisResults', 'agentActivityLog', 'kpis', 'timelineEvents', 'caseEntities', 'knowledgeItems', 'contradictions', 'tags', 'auditLog'];

    const caseDataDocSnap = await fbGetDoc(getCaseDataRef(userId));
    if(caseDataDocSnap.exists()) {
      const caseDataDoc = caseDataDocSnap.data() as CaseContext;
      exportData.caseDescription = caseDataDoc.caseDescription;
      exportData.risks = caseDataDoc.risks;
      exportData.mitigationStrategies = caseDataDoc.mitigationStrategies;
    }

    for (const collectionName of collectionsToExport) {
        const q = getCollectionRef(userId, collectionName);
        const querySnapshot = await getDocs(q);
        (exportData as any)[collectionName] = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    }

    return JSON.stringify(exportData, null, 2);
}

export const importCase = async (userId: string, jsonData: string): Promise<void> => {
    const importData: AppState = JSON.parse(jsonData);

    const collectionsToProcess = ['documents', 'generatedDocuments', 'documentAnalysisResults', 'detailedAnalysisResults', 'agentActivityLog', 'kpis', 'timelineEvents', 'caseEntities', 'knowledgeItems', 'contradictions', 'tags', 'auditLog'];
    
    // Clear existing data in batches
    for (const collectionName of collectionsToProcess) {
        const snapshot = await getDocs(getCollectionRef(userId, collectionName));
        const batch = writeBatch(db);
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
    await setDoc(getCaseDataRef(userId), caseDataToImport);

    for (const collectionName of collectionsToProcess) {
        const dataToImport = (importData as any)[collectionName];
        if (dataToImport && Array.isArray(dataToImport)) {
             const batch = writeBatch(db);
             dataToImport.forEach(item => {
                 const { id, ...data } = item;
                 const docRef = id ? doc(getCollectionRef(userId, collectionName), id) : doc(getCollectionRef(userId, collectionName));
                 batch.set(docRef, data);
             });
             await batch.commit();
        }
    }
}