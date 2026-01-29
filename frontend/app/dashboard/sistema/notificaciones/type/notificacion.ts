export enum NotificationType {
  CONTEO_MENSUAL_PROXIMO = "CONTEO_MENSUAL_PROXIMO",
  CONTEO_MENSUAL_VENCIDO = "CONTEO_MENSUAL_VENCIDO",
  CONTEO_MENSUAL_COMPLETADO = "CONTEO_MENSUAL_COMPLETADO",
  CONTEO_ANUAL_PROXIMO = "CONTEO_ANUAL_PROXIMO",
  CONTEO_ANUAL_VENCIDO = "CONTEO_ANUAL_VENCIDO",
  CONTEO_ANUAL_COMPLETADO = "CONTEO_ANUAL_COMPLETADO",
  GENERAL = "GENERAL",
}

export type Notification = {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
};