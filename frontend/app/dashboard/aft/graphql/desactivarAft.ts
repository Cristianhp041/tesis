import { gql } from "@apollo/client";

export const DESACTIVAR_AFT = gql`
  mutation DesactivarAft($id: Int!) {
    desactivarAft(id: $id) {
      id
      activo
    }
  }
`;
