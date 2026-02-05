import { gql } from "@apollo/client";

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($id: Int!) {
    deactivateUser(id: $id) {
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
