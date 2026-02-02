import { gql } from "@apollo/client";

export const GET_SUBCLASIFICACIONES = gql`
query {subclasificacionesActivas {
    id
    nombre
  }
}

`;
