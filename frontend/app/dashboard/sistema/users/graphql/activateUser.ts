import { gql } from "@apollo/client";

export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: Int!) {
    activateUser(id: $id) {
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