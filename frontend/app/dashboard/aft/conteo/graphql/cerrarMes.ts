import { gql } from "@apollo/client";

export const CERRAR_MES = gql`
  mutation CerrarMes($asignacionId: Int!) {
    cerrarMes(asignacionId: $asignacionId) {
      id
      estado
    }
  }
`;