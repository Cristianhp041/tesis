import { gql } from "@apollo/client";

export const UPDATE_USER = gql`
  mutation UpdateUser($id: Int!, $data: UpdateUserInput!) {
    updateUser(id: $id, data: $data) {
      id
      email
      name
      role
      active
      emailVerified
    }
  }
`;