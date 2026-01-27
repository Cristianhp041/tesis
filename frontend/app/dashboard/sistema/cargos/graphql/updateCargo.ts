import { gql } from "@apollo/client";

export const UPDATE_CARGO = gql`
  mutation UpdateCargo($id: Int!, $data: UpdateCargoDto!) {
    updateCargo(id: $id, data: $data) {
      id
      nombre
      activo
    }
  }
`;
