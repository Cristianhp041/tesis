import { gql } from "@apollo/client";

export const CREATE_MUNICIPIO = gql`
  mutation CreateMunicipio($data: CreateMunicipioDto!) {
    createMunicipio(data: $data) {
      id
      nombre
      provinciaId
    }
  }
`;
