import { gql } from "@apollo/client";

export const UPDATE_MUNICIPIO = gql`
  mutation UpdateMunicipio($id: Int!, $data: UpdateMunicipioDto!) {
    updateMunicipio(id: $id, data: $data) {
      id
      nombre
    }
  }
`;
