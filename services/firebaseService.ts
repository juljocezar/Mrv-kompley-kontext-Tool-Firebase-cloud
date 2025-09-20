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

/**
 * @en Gets a reference to a specific Firestore collection for a user.
 * @de Ruft eine Referenz auf eine bestimmte Firestore-Sammlung für einen Benutzer ab.
 * @param userId - The ID of the user.
 * @param collectionName - The name of the collection.
 * @returns A Firestore collection reference.
 */
const getCollectionRef = (userId: string, collectionName: string) => {
    return db.collection('users').doc(userId).collection(collectionName);
}

/**
 * @en Gets a reference to the main case data document for a user.
 * @de Ruft eine Referenz auf das Haupt-Falldatendokument für einen Benutzer ab.
 * @param userId - The ID of the user.
 * @returns A Firestore document reference.
 */
const getCaseDataRef = (userId: string) => {
    return db.collection('users').doc(userId).collection('caseData').doc('main');
}

/**
 * @en Subscribes to a Firestore collection and updates the state with its data.
 * @de Abonniert eine Firestore-Sammlung und aktualisiert den Zustand mit ihren Daten.
 * @param userId - The ID of the user.
 * @param collectionName - The name of the collection to subscribe to.
 * @param setData - A callback function to set the data in the component's state.
 * @returns An unsubscribe function to detach the listener.
 */
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

/**
 * @en Subscribes to the main case data document for a user.
 * @de Abonniert das Haupt-Falldatendokument für einen Benutzer.
 * @param userId - The ID of the user.
 * @param setData - A callback function to set the case data in the component's state.
 * @returns An unsubscribe function to detach the listener.
 */
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

/**
 * @en Adds a new document to a specific Firestore collection.
 * @de Fügt ein neues Dokument zu einer bestimmten Firestore-Sammlung hinzu.
 * @param userId - The ID of the user.
 * @param collectionName - The name of the collection.
 * @param data - The data object to add.
 * @returns A promise that resolves with the new document reference.
 */
export const addDoc = async <T extends object>(userId: string, collectionName: string, data: T) => {
    return await getCollectionRef(userId, collectionName).add(data);
}

/**
 * @en Updates an existing document in a specific Firestore collection.
 * @de Aktualisiert ein vorhandenes Dokument in einer bestimmten Firestore-Sammlung.
 * @param userId - The ID of the user.
 * @param collectionName - The name of the collection.
 * @param docId - The ID of the document to update.
 * @param data - An object containing the fields and values to update.
 * @returns A promise that resolves when the update is complete.
 */
export const updateDoc = async (userId: string, collectionName: string, docId: string, data: any) => {
    const docRef = getCollectionRef(userId, collectionName).doc(docId);
    return await docRef.update(data);
}

/**
 * @en Retrieves a single document from a Firestore collection.
 * @de Ruft ein einzelnes Dokument aus einer Firestore-Sammlung ab.
 * @param userId - The ID of the user.
 * @param collectionName - The name of the collection.
 * @param docId - The ID of the document to retrieve.
 * @returns A promise that resolves with the document data or null if it doesn't exist.
 */
export const getDoc = async <T>(userId: string, collectionName: string, docId: string): Promise<T | null> => {
    const docRef = getCollectionRef(userId, collectionName).doc(docId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return { ...docSnap.data(), id: docSnap.id } as T;
    }
    return null;
}

/**
 * @en Deletes a document from a specific Firestore collection.
 * @de Löscht ein Dokument aus einer bestimmten Firestore-Sammlung.
 * @param userId - The ID of the user.
 * @param collectionName - The name of the collection.
 * @param docId - The ID of the document to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteDoc = async (userId: string, collectionName: string, docId: string) => {
    const docRef = getCollectionRef(userId, collectionName).doc(docId);
    return await docRef.delete();
}

/**
 * @en Updates the main case data document for a user.
 * @de Aktualisiert das Haupt-Falldatendokument für einen Benutzer.
 * @param userId - The ID of the user.
 * @param data - An object containing the case data fields to update.
 * @returns A promise that resolves when the update is complete.
 */
export const updateCaseData = async (userId: string, data: Partial<{ caseDescription: string, risks: Risks, mitigationStrategies: string, settings: AppSettings }>) => {
    await getCaseDataRef(userId).set(data, { merge: true });
}

/**
 * @en Exports all case data for a user into a JSON string.
 * @de Exportiert alle Falldaten für einen Benutzer in einen JSON-String.
 * @param userId - The ID of the user.
 * @returns A promise that resolves with the JSON string of the exported data.
 */
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

/**
 * @en Imports case data from a JSON string for a user, overwriting existing data.
 * @de Importiert Falldaten aus einem JSON-String für einen Benutzer und überschreibt dabei vorhandene Daten.
 * @param userId - The ID of the user.
 * @param jsonData - The JSON string containing the case data to import.
 * @returns A promise that resolves when the import is complete.
 */
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