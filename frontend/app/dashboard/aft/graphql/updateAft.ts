import { gql } from "@apollo/client";

export const UPDATE_AFT = gql`
  mutation UpdateAft($id: Int!, $data: UpdateAftDto!) {
    updateAft(id: $id, data: $data) {
      id
      rotulo
      nombre
      activo
    }
  }
`;
