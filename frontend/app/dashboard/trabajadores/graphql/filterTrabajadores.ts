import { gql } from "@apollo/client";

export const FILTER_TRABAJADORES = gql`
  query FilterTrabajadores($filters: TrabajadorFilterInput) {
    filterTrabajadores(filters: $filters) {
      total
      data {
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
  }
`;
