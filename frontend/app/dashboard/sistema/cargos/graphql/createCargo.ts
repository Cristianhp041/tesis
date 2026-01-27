import { gql } from "@apollo/client";

export const CREATE_CARGO = gql`
  mutation CreateCargo($data: CreateCargoDto!) {
    createCargo(data: $data) {
      id
      nombre
      activo
    }
  }
`;
