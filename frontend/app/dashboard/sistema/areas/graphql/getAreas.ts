import { gql } from "@apollo/client";

export const GET_AREAS = gql`
  query GetAreas {
  areas {
    id
    nombre
    activo
  }
}
`;
