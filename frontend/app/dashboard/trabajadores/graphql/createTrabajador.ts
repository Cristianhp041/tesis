import { gql } from "@apollo/client";

export const CREATE_TRABAJADOR = gql`
  mutation CreateTrabajador($data: CreateTrabajadorDto!) {
    createTrabajador(data: $data) {
      id
      nombre
      apellidos
      expediente
      telefono
    }
  }
`;
