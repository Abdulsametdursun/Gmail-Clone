import { db } from '../firebase';
import firebase from 'firebase';

export async function saveDraft(draft) {
  try {
    if (draft.id) {
      await db
        .collection('emails')
        .doc(draft.id)
        .set(
          {
            to: draft.to,
            subject: draft.subject,
            message: draft.message,
            folder: 'drafts',
            category: 'Primary',
            labels: ['Drafts'],
            read: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      return { id: draft.id };
    } else {
      const doc = await db.collection('emails').add({
        to: draft.to,
        subject: draft.subject,
        message: draft.message,
        folder: 'drafts',
        category: 'Primary',
        labels: ['Drafts'],
        read: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return { id: doc.id };
    }
  } catch (e) {
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    if (draft.id) {
      const index = drafts.findIndex((d) => d.id === draft.id);
      if (index >= 0) {
        drafts[index] = { ...draft, folder: 'drafts', timestamp: Date.now() };
      } else {
        drafts.push({ ...draft, folder: 'drafts', timestamp: Date.now() });
      }
    } else {
      draft.id = Date.now().toString();
      drafts.push({ ...draft, folder: 'drafts', timestamp: Date.now() });
    }
    localStorage.setItem('drafts', JSON.stringify(drafts));
    return { id: draft.id };
  }
}

export async function loadDrafts() {
  try {
    const snapshot = await db
      .collection('emails')
      .where('folder', '==', 'drafts')
      .orderBy('timestamp', 'desc')
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    return JSON.parse(localStorage.getItem('drafts') || '[]');
  }
}

export async function deleteDraft(id) {
  try {
    await db.collection('emails').doc(id).delete();
  } catch (e) {
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    const filtered = drafts.filter((d) => d.id !== id);
    localStorage.setItem('drafts', JSON.stringify(filtered));
  }
}
