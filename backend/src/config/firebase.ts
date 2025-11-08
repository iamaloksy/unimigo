import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin with service account
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: `firebase-adminsdk@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig as any),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.log('⚠️  Firebase Admin initialization note:', error);
}

export const auth = admin.auth();
export default admin;