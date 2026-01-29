import { gql } from "@apollo/client";

export const MARK_AS_READ = gql`
  mutation MarkNotificationAsRead($id: Int!) {
    markNotificationAsRead(id: $id) {
      id
      read
      readAt
    }
  }
`;