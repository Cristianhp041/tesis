import { gql } from "@apollo/client";

export const REJECT_USER = gql`
  mutation RejectUser($userId: Int!, $reason: String) {
    rejectUser(userId: $userId, reason: $reason) {
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