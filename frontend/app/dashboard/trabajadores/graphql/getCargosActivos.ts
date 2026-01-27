import { gql } from "@apollo/client";

export const GET_CARGOS_ACTIVOS = gql`
  query CargosActivos {
    cargosActivos {
      id
      nombre
      activo
    }
  }
`;