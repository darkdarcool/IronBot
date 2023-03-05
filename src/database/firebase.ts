import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./sdk-key.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export async function set(col: string, doc: string, data: any) {
  await db.collection(col).doc(doc).set(data);
}

export async function get<T>(col: string, doc: string): Promise<T> {
  return (await db.collection(col).doc(doc).get()).data() as unknown as Promise<T>;
}

export async function exists(col: string, doc: string) {
  return await db.collection(col).doc(doc).get().then((doc) => doc.exists);
}

export async function update(col: string, doc: string, data: any) {
  db.collection(col).doc(doc).update(data);
}