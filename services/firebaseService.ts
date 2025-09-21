// Fix: Update to modular Firebase v9 SDK
// Fix: Use namespace import to fix issue where named exports from 'firebase/app' are not found.
import * as firebase from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    onSnapshot, 
    addDoc as firestoreAddDoc, 
    updateDoc as firestoreUpdateDoc, 
    getDoc as firestoreGetDoc, 
    deleteDoc as firestoreDeleteDoc, 
    setDoc, 
    getDocs, 
    writeBatch,
    arrayUnion
} from 'firebase/firestore';

import type { AppState, CaseContext, Risks, AppSettings, Document, EntityRelationship } from '../types';

// TODO: Ersetzen Sie dies durch Ihre tatsächliche Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Fix: Use v9 initialization
// Fix: Call getApps and initializeApp from the imported firebase namespace.
if (!firebase.getApps().length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const db = getFirestore();

// Use Emulators in development
// if (window.location.hostname === "localhost") {
//   auth.useEmulator("http://localhost:9099");
//   db.useEmulator("localhost", 8080);
// }

// --- Generic Firestore Functions ---

const getCollectionRef = (userId: string, collectionName: string) => {
    return collection(db, 'users', userId, collectionName);
}

const getCaseDataRef = (userId: string) => {
    return doc(db, 'users', userId, 'caseData', 'main');
}

export const subscribeToCollection = <T>(userId: string, collectionName: string, setData: (data: T[]) => void): (() => void) => {
    const query = getCollectionRef(userId, collectionName);
    const unsubscribe = onSnapshot(query, (querySnapshot) => {
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
    return await firestoreAddDoc(getCollectionRef(userId, collectionName), data);
}

export const updateDoc = async (userId: string, collectionName: string, docId: string, data: any) => {
    const docRef = doc(getCollectionRef(userId, collectionName), docId);
    return await firestoreUpdateDoc(docRef, data);
}

export const getDoc = async <T>(userId: string, collectionName: string, docId: string): Promise<T | null> => {
    const docRef = doc(getCollectionRef(userId, collectionName), docId);
    const docSnap = await firestoreGetDoc(docRef);
    if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as T;
    }
    return null;
}

export const deleteDoc = async (userId: string, collectionName: string, docId: string) => {
    const docRef = doc(getCollectionRef(userId, collectionName), docId);
    return await firestoreDeleteDoc(docRef);
}

export const updateCaseData = async (userId: string, data: Partial<{ caseDescription: string, risks: Risks, mitigationStrategies: string, settings: AppSettings }>) => {
    await setDoc(getCaseDataRef(userId), data, { merge: true });
}

export const addRelationshipToEntity = async (userId: string, sourceEntityId: string, relationship: EntityRelationship) => {
    const entityRef = doc(getCollectionRef(userId, 'caseEntities'), sourceEntityId);
    return await firestoreUpdateDoc(entityRef, {
        relationships: arrayUnion(relationship)
    });
};

export const exportCase = async (userId: string): Promise<string> => {
    const exportData: Partial<AppState> = {};
    const collectionsToExport = ['documents', 'generatedDocuments', 'documentAnalysisResults', 'detailedAnalysisResults', 'agentActivityLog', 'kpis', 'timelineEvents', 'caseEntities', 'knowledgeItems', 'contradictions', 'tags', 'auditLog'];

    const caseDataDocSnap = await firestoreGetDoc(getCaseDataRef(userId));
    if(caseDataDocSnap.exists()) {
      const caseDataDoc = caseDataDocSnap.data() as CaseContext;
      exportData.caseDescription = caseDataDoc.caseDescription;
      exportData.risks = caseDataDoc.risks;
      exportData.mitigationStrategies = caseDataDoc.mitigationStrategies;
    }

    for (const collectionName of collectionsToExport) {
        const query = getCollectionRef(userId, collectionName);
        const querySnapshot = await getDocs(query);
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
             dataToImport.forEach((item: any) => {
                 const { id, ...data } = item;
                 const docRef = id ? doc(getCollectionRef(userId, collectionName), id) : doc(getCollectionRef(userId, collectionName));
                 batch.set(docRef, data);
             });
             await batch.commit();
        }
    }
}