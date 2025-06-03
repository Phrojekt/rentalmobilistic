import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/services/notificationService';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const userNotifications = await notificationService.getUserNotifications(user.uid);
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh: async () => {
      if (!user) return;
      setLoading(true);
      const userNotifications = await notificationService.getUserNotifications(user.uid);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
      setLoading(false);
    }
  };
}
