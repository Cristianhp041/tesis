import { gql } from "@apollo/client";

export const GET_MUNICIPIOS_BY_PROVINCIA = gql`
  query GetMunicipiosByProvincia($provinciaId: Int!) {
    municipiosByProvincia(provinciaId: $provinciaId) {
      id
      nombre
    }
  }
`;
