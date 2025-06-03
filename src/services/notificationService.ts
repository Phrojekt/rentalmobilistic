import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Notification {
  id: string;
  userId: string;
  type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data: {
    carId: string;
    bookingId: string;
    renterId: string;
    [key: string]: string;
  };
}

const convertToNotification = (doc: QueryDocumentSnapshot<DocumentData>): Notification => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: (data.createdAt as Timestamp).toDate()
  } as Notification;
};

export const notificationService = {
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data: Notification['data']
  ): Promise<string> {
    try {
      const notificationData = {
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: Timestamp.now(),
        data
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertToNotification);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    if (!userId) return () => {};

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(convertToNotification);
      callback(notifications);
    }, (error) => {
      console.error('Error in notifications subscription:', error);
    });
  }
};
