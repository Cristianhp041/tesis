import { gql } from "@apollo/client";

export const GET_SUBCLASIFICACIONES_ACTIVAS = gql`
  query GetSubclasificacionesActivas {
    subclasificacionesActivas {
      id
      nombre
    }
  }
`;
