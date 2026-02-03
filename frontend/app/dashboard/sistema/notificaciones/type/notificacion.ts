export enum NotificationType {
  CONTEO_MENSUAL_PROXIMO = "CONTEO_MENSUAL_PROXIMO",
  CONTEO_MENSUAL_VENCIDO = "CONTEO_MENSUAL_VENCIDO",
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