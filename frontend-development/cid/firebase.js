import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "cid-development.firebaseapp.com",
    projectId: "cid-development",
    // ... alle Werte aus Firebase Console kopieren
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);