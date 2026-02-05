import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers($active: String) {
    users(active: $active) {
      id
      email
      name
      role
      active
      approvalStatus
    }
  }
`;