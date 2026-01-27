import { gql } from "@apollo/client";

export const GET_AFTS = gql`
query GetAfts {
  afts {
    id
    nombre
    rotulo
    activo
    area {
      id
      nombre
    }
    subclasificacion {
      id
      nombre
    }
  }
}
`;
