import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = require("../../serviceAccountKey.json");

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
