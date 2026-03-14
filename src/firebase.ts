import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDwOrv7ecJeti22SoNTqCd3SRuTLWKsUC0",
  authDomain: "niklaus-systems.firebaseapp.com",
  projectId: "niklaus-systems",
  storageBucket: "niklaus-systems.firebasestorage.app",
  messagingSenderId: "229812737163",
  appId: "1:229812737163:web:dba77f7dc9f4ff20f8308e"
};

const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);

export default app;
