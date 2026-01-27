import { gql } from "@apollo/client";

export const MOVER_AFTS_MASIVO = gql`
  mutation MoverAftsMasivo($data: BulkMoveAftInput!) {
    moverAftsMasivo(data: $data) {
      id
      area {
        id
        nombre
      }
    }
  }
`;
