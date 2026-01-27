import { gql } from "@apollo/client";

export const GET_MUNICIPIOS = gql`
  query GetMunicipios($provinciaId: Int!) {
    municipios(provinciaId: $provinciaId) {
      id
      nombre
    }
  }
`;
