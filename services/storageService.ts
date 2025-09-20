import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

// Ensure Firebase is initialized
if (!firebase.apps.length) {
  // You should ideally import your firebaseConfig and initialize it here
  // For now, this assumes it's initialized in firebaseService.ts
}

const storage = firebase.storage();

/**
 * @en Uploads a file to a user-specific path in Firebase Storage.
 * @de Lädt eine Datei in einen benutzerspezifischen Pfad im Firebase Storage hoch.
 * @param userId - The ID of the user uploading the file.
 * @param file - The file object to upload.
 * @param path - The path within the user's storage to upload the file to (e.g., 'documents/report.pdf').
 * @returns A promise that resolves with the download URL of the uploaded file.
 */
export const uploadFile = async (userId: string, file: File, path: string): Promise<string> => {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(`users/${userId}/${path}`);
    await fileRef.put(file);
    const downloadURL = await fileRef.getDownloadURL();
    return downloadURL;
};

/**
 * @en Gets the download URL for a file in Firebase Storage.
 * @de Ruft die Download-URL für eine Datei im Firebase Storage ab.
 * @param userId - The ID of the user who owns the file.
 * @param path - The path of the file within the user's storage.
 * @returns A promise that resolves with the download URL of the file.
 */
export const getDownloadURL = async (userId: string, path: string): Promise<string> => {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(`users/${userId}/${path}`);
    return await fileRef.getDownloadURL();
};

/**
 * @en Deletes a file from Firebase Storage.
 * @de Löscht eine Datei aus dem Firebase Storage.
 * @param userId - The ID of the user who owns the file.
 * @param path - The path of the file within the user's storage to delete.
 * @returns A promise that resolves when the file is deleted.
 */
export const deleteFile = async (userId: string, path: string): Promise<void> => {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(`users/${userId}/${path}`);
    await fileRef.delete();
};
