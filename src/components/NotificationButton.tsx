"use client";

import { useNotifications } from '@/hooks/useNotifications';

interface NotificationButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export default function NotificationButton({ onClick, isActive }: NotificationButtonProps) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg font-bold ${
        isActive ? 'bg-[#EA580C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      Notifications
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
