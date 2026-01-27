import { gql } from "@apollo/client";

export const CREATE_PROVINCIA = gql`
  mutation CreateProvincia($data: CreateProvinciaDto!) {
    createProvincia(data: $data) {
      id
      nombre
    }
  }
`;
