import { gql } from "@apollo/client";

export const CREATE_SUBCLASIFICACION = gql`
  mutation CreateSubclasificacion($input: CreateSubclasificacionDto!) {
    createSubclasificacion(input: $input) {
      id
      nombre
      activo
    }
  }
`;
