import { gql } from "@apollo/client";

export const UPDATE_AREA = gql`
  mutation UpdateArea($id: Int!, $data: UpdateAreaDto!) {
    updateArea(id: $id, data: $data) {
      id
      nombre
      activo
    }
  }
`;
