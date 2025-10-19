// lib/firebaseAdmin.ts
import admin from "firebase-admin";
import serviceAccount from "../../firebaseServiceAccount.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://realtime-chat-app-d0191-default-rtdb.europe-west1.firebasedatabase.app",
  });
}

export const adminDb = admin.database();
export const adminAuth = admin.auth();
