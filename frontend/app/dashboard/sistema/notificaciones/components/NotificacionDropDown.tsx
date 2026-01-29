"use client";

import { CheckCheck, Loader2 } from "lucide-react";
import NotificationItem from "./Notificacionitem";
import { Notification } from "../type/notificacion";

interface Props {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationDropdown({
  notifications,
  loading,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: Props) {
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">
          Notificaciones
          {unreadCount > 0 && (
            <span className="ml-2 text-xs text-blue-600">
              ({unreadCount} sin leer)
            </span>
          )}
        </h3>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">
              No tienes notificaciones
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={onMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
}