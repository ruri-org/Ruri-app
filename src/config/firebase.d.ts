import type { FirebaseApp } from 'firebase/app';
import type { Auth, GoogleAuthProvider } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

export declare const auth: Auth;
export declare const googleProvider: GoogleAuthProvider;
export declare const db: Firestore;
export declare const storage: FirebaseStorage;
declare const app: FirebaseApp;
export default app;
