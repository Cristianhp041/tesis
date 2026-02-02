import { gql } from "@apollo/client";

export const GET_AREAS_ACTIVAS = gql`
  query GetAreasActivas {
    areasActivas {
      id
      nombre
    }
  }
`;
