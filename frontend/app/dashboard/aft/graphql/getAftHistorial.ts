import { gql } from "@apollo/client";

export const GET_AFT_HISTORIAL = gql`
  query GetAftHistorial($id: Int!) {
    aft(id: $id) {
      id
      historial {
        id
        descripcion
        fecha
      }
    }
  }
`;
