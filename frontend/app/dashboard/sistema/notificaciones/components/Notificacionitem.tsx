"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, AlertCircle, Calendar } from "lucide-react";
import { Notification, NotificationType } from "../type/notificacion";

interface Props {
  notification: Notification;
  onRead: (id: number) => void;
}

export default function NotificationItem({ notification, onRead }: Props) {
  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.CONTEO_MENSUAL_VENCIDO:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      
      case NotificationType.CONTEO_MENSUAL_PROXIMO:
        return <Calendar className="w-5 h-5 text-blue-500" />;
      
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      onClick={handleClick}
      className={`p-3 hover:bg-gray-50 transition cursor-pointer border-b border-gray-100 ${
        !notification.read ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
            )}
          </div>

          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}