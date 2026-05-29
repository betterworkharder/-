import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from './messageService';

export interface FeedbackData {
  content: string;
  contact?: string;
}

export const feedbackService = {
  async submitFeedback(data: FeedbackData) {
    const path = 'feedbacks';
    try {
      await addDoc(collection(db, path), {
        ...data,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};
