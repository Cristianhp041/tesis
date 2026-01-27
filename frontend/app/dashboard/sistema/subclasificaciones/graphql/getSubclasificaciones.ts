import { gql } from "@apollo/client";

export const GET_SUBCLASIFICACIONES = gql`
  query GetSubclasificaciones {
    subclasificaciones {
      id
      nombre
      activo
    }
  }
`;
