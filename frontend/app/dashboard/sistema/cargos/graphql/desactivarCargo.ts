import { gql } from "@apollo/client";

export const DESACTIVAR_CARGO = gql`
  mutation RemoveCargo($id: Int!) {
    removeCargo(id: $id)
  }
`;
