import { gql } from "@apollo/client";

export const UPDATE_TRABAJADOR = gql`
  mutation UpdateTrabajador($id: Int!, $data: UpdateTrabajadorInput!) {
    updateTrabajador(id: $id, data: $data) {
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
