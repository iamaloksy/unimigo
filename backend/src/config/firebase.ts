import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let auth: admin.auth.Auth;

try {
  // Initialize Firebase Admin - in development mode without service account
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  auth = admin.auth();
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.log('⚠️  Firebase Admin will work in dev mode without full verification');
  // Create a mock auth object for development
  auth = {
    verifyIdToken: async (token: string) => {
      console.log('🔧 Dev mode: Skipping Firebase token verification');
      return { uid: `dev_${Date.now()}`, email: 'dev@test.com' };
    },
  } as any;
}

export { auth };
export default admin;