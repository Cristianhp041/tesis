import { gql } from "@apollo/client";

export const GET_CANTIDAD_AFTS_DESACTIVADOS = gql`
  query GetCantidadAftsDesactivados($asignacionId: Int!) {
    cantidadAftsDesactivados(asignacionId: $asignacionId)
  }
`;