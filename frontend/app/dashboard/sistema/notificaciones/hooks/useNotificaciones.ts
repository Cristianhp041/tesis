import { useQuery, useMutation } from "@apollo/client/react";
import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

import { GET_MY_NOTIFICATIONS } from "../graphql/getMyNotificacion";
import { GET_UNREAD_COUNT } from "../graphql/getUnreadCount";
import { MARK_AS_READ } from "../graphql/MarcarLeido";
import { MARK_ALL_AS_READ } from "../graphql/MarcarAllLeido";
import { type Notification as NotificationData, NotificationType } from "../type/notificacion";

interface UseNotificationsOptions {
  autoRefreshInterval?: number;
  unreadOnly?: boolean;
  limit?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    autoRefreshInterval = 30000,
    unreadOnly = false,
    limit = 50,
  } = options;

  const previousCountRef = useRef<number | null>(null);

  const {
    data: notificationsData,
    loading: loadingNotifications,
    refetch: refetchNotifications,
  } = useQuery<{ myNotifications: NotificationData[] }>(GET_MY_NOTIFICATIONS, {
    variables: { unreadOnly, limit },
    pollInterval: autoRefreshInterval,
  });

  const {
    data: countData,
    loading: loadingCount,
    refetch: refetchCount,
  } = useQuery<{ unreadNotificationsCount: number }>(GET_UNREAD_COUNT, {
    pollInterval: autoRefreshInterval,
  });

  const [markAsReadMutation] = useMutation(MARK_AS_READ, {
    refetchQueries: [
      { query: GET_MY_NOTIFICATIONS, variables: { unreadOnly, limit } },
      { query: GET_UNREAD_COUNT },
    ],
  });

  const [markAllAsReadMutation] = useMutation(MARK_ALL_AS_READ, {
    refetchQueries: [
      { query: GET_MY_NOTIFICATIONS, variables: { unreadOnly, limit } },
      { query: GET_UNREAD_COUNT },
    ],
  });

  const showToastNotification = useCallback((notification: NotificationData) => {
    const getToastConfig = (type: NotificationType) => {
      switch (type) {
        case NotificationType.CONTEO_MENSUAL_VENCIDO:
        case NotificationType.CONTEO_ANUAL_VENCIDO:
          return { type: "error" as const };
        case NotificationType.CONTEO_MENSUAL_COMPLETADO:
        case NotificationType.CONTEO_ANUAL_COMPLETADO:
          return { type: "success" as const };
        case NotificationType.CONTEO_MENSUAL_PROXIMO:
        case NotificationType.CONTEO_ANUAL_PROXIMO:
          return { type: "info" as const };
        default:
          return { type: "info" as const };
      }
    };

    const config = getToastConfig(notification.type);

    if (config.type === "error") {
      toast.error(notification.title, {
        description: notification.message,
        duration: 8000,
      });
    } else if (config.type === "success") {
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    } else {
      toast.info(notification.title, {
        description: notification.message,
        duration: 6000,
      });
    }
  }, []);

  // Detectar nuevas notificaciones y mostrar toast
  useEffect(() => {
    const currentCount = countData?.unreadNotificationsCount ?? 0;

    if (previousCountRef.current === null) {
      previousCountRef.current = currentCount;
      return;
    }

    if (currentCount > previousCountRef.current) {
      const newNotifications = notificationsData?.myNotifications.filter(
        (n) => !n.read
      ) ?? [];

      if (newNotifications.length > 0) {
        const latestNotification = newNotifications[0];
        showToastNotification(latestNotification);
      }
    }

    previousCountRef.current = currentCount;
  }, [countData?.unreadNotificationsCount, notificationsData, showToastNotification]);

  const markAsRead = async (id: number) => {
    try {
      await markAsReadMutation({ variables: { id } });
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation();
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  const refresh = () => {
    refetchNotifications();
    refetchCount();
  };

  return {
    notifications: notificationsData?.myNotifications ?? [],
    unreadCount: countData?.unreadNotificationsCount ?? 0,
    loading: loadingNotifications || loadingCount,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}