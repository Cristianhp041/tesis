import { gql } from "@apollo/client";

export const COMPLETAR_MES = gql`
  mutation CompletarMes($asignacionId: Int!) {
    completarMes(asignacionId: $asignacionId) {
      id
      estado
      activosContados
      activosEncontrados
      activosFaltantes
      activosConDiscrepancias
    }
  }
`;