import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA5tvFUP3tfky1dDl8blcyerC81VU3mAK4",
  authDomain: "unimigo-ec05b.firebaseapp.com",
  projectId: "unimigo-ec05b",
  storageBucket: "unimigo-ec05b.firebasestorage.app",
  messagingSenderId: "301314867817",
  appId: "1:301314867817:web:ef11b4b8e43026d81e18f8",
  measurementId: "G-DVDYHKS80F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;