import * as admin from 'firebase-admin';

// Initialize Firebase Admin once
export function getFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    // Replace escaped newlines if passed via environment variable string
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    if (clientEmail && privateKey && projectId) {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      // Initialize with default application credentials or project ID
      return admin.initializeApp({
        projectId: projectId || 'voice-ai-851c3',
      });
    }
  } catch (err) {
    console.warn('Firebase Admin initialization notice:', err);
    return admin.app();
  }
}

export function getAdminFirestore() {
  const app = getFirebaseAdminApp();
  return admin.firestore(app);
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();
  return admin.auth(app);
}
