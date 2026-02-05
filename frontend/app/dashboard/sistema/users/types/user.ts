export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  approvalStatus: ApprovalStatus;
}