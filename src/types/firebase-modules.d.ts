/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'firebase/firestore' {
  export const getFirestore: any;
  export const doc: any;
  export const getDoc: any;
  export const setDoc: any;
  export const updateDoc: any;
  export const deleteDoc: any;
  export const addDoc: any;
  export const collection: any;
  export const query: any;
  export const where: any;
  export const getDocs: any;
  export const orderBy: any;
  export const limit: any;
  export const serverTimestamp: any;
  export type Firestore = any;
  export type DocumentReference = any;
  export type CollectionReference = any;
  export type Query = any;
  export type DocumentSnapshot = any;
  export type QuerySnapshot = any;
}

declare module 'firebase/auth' {
  export const getAuth: any;
  export const GoogleAuthProvider: any;
  export const onAuthStateChanged: any;
  export const signInWithEmailAndPassword: any;
  export const createUserWithEmailAndPassword: any;
  export const signInWithPopup: any;
  export const signOut: any;
  export const sendPasswordResetEmail: any;
  export const updateProfile: any;
  export type User = any;
  export type Auth = any;
}

declare module 'firebase/app' {
  export const initializeApp: any;
  export const getApps: any;
  export const getApp: any;
  export type FirebaseApp = any;
}

declare module 'firebase/storage' {
  export const getStorage: any;
  export type FirebaseStorage = any;
}
