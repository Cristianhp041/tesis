import { gql } from "@apollo/client";

export const APPROVE_USER = gql`
  mutation ApproveUser($userId: Int!) {
    approveUser(userId: $userId) {
      id
      email
      name
      role
      active
      emailVerified
      approvalStatus
    }
  }
`;
