import { gql } from "@apollo/client";

export const GET_CARGOS = gql`
  query GetCargos {
    cargos {
      id
      nombre
    }
  }
`;
