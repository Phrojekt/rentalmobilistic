"use client";

import { useNotifications } from '@/hooks/useNotifications';
import { cartService } from '@/services/cartService';
import { carService } from '@/services/carService';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/services/notificationService';
import toast from 'react-hot-toast';

export default function NotificationList() {
  const { notifications, loading, refresh } = useNotifications();  const handleApproveBooking = async (notification: Notification) => {
    try {
      // First check if the rental is still pending
      const rental = await cartService.getCartItemById(notification.data.bookingId);
      if (!rental) {
        toast.error('Rental request not found');
        return;
      }
      
      // Show appropriate message based on rental status
      if (rental.status !== 'pending') {
        const statusMessage = {
          'confirmed': 'This rental has already been approved',
          'cancelled': 'This rental request has been cancelled',
          'completed': 'This rental has already been completed'
        }[rental.status] || 'This rental request is no longer pending';
        
        toast.error(statusMessage);
        await notificationService.markAsRead(notification.id);
        refresh();
        return;
      }

      // Update car availability first
      await carService.updateCarAvailability(notification.data.carId, 'rented');
      
      // Then update cart item status to confirmed
      await cartService.updateCartItem(notification.data.bookingId, { status: 'confirmed' });
      
      // Mark notification as read
      await notificationService.markAsRead(notification.id);
      
      // Create a new notification for the renter
      await notificationService.createNotification(
        notification.data.renterId,
        'booking_confirmed',
        'Booking Approved',
        'Your booking request has been approved! The car is now reserved for you.',
        {
          carId: notification.data.carId,
          bookingId: notification.data.bookingId,
          renterId: notification.data.renterId
        }
      );

      toast.success('Booking approved successfully');
      refresh();
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (notification: Notification) => {
    try {
      // Update cart item status to cancelled
      await cartService.updateCartItem(notification.data.bookingId, { status: 'cancelled' });
      
      // Mark notification as read
      await notificationService.markAsRead(notification.id);
      
      // Create a new notification for the renter
      await notificationService.createNotification(
        notification.data.renterId,
        'booking_cancelled',
        'Booking Rejected',
        'Your booking request has been rejected by the owner.',
        {
          carId: notification.data.carId,
          bookingId: notification.data.bookingId,
          renterId: notification.data.renterId
        }
      );

      toast.success('Booking rejected successfully');
      refresh();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  };

  if (loading) {
    return <div className="text-center text-black py-4">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return <div className="text-center py-4 text-gray-500">No notifications</div>;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border ${
            notification.read ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-black">{notification.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
              <p className="text-gray-400 text-xs mt-2">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
            {notification.type === 'booking_request' && !notification.read && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproveBooking(notification)}
                  className="px-3 py-1 bg-[#EA580C] text-white rounded-lg text-sm hover:bg-[#EA580C]/90"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleRejectBooking(notification)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
