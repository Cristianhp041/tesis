export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  active: boolean;
}
