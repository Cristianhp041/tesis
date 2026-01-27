import { gql } from "@apollo/client";

export const DELETE_TRABAJADOR = gql`
  mutation RemoveTrabajador($id: Int!) {
    removeTrabajador(id: $id)
  }
`;
