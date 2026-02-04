export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
}

export interface GetMeResponse {
  me: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
}