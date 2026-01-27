import { gql } from "@apollo/client";

export const GET_TRABAJADORES = gql`
  query GetTrabajadores {
    trabajadores {
      id
      nombre
      apellidos
      expediente
      telefono
      activo

      cargo {
        id
        nombre
      }

      provincia {
        id
        nombre
      }

      municipio {
        id
        nombre
      }
    }
  }
`;
