import { gql } from "@apollo/client";

export const DESACTIVAR_AFTS_MASIVO = gql`
  mutation DesactivarAftsMasivo($data: BulkAftInput!) {
    desactivarAftsMasivo(data: $data) {
      id
      activo
    }
  }
`;
