import { gql } from "@apollo/client";

export const UPDATE_PROVINCIA = gql`
  mutation UpdateProvincia($id: Int!, $data: UpdateProvinciaDto!) {
    updateProvincia(id: $id, data: $data) {
      id
      nombre
    }
  }
`;
