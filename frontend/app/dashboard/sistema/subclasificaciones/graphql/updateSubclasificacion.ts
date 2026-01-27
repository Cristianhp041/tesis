import { gql } from "@apollo/client";

export const UPDATE_SUBCLASIFICACION = gql`
  mutation UpdateSubclasificacion(
    $id: Int!
    $data: UpdateSubclasificacionDto!
  ) {
    updateSubclasificacion(id: $id, data: $data) {
      id
      nombre
      activo
    }
  }
`;
