import { gql } from "@apollo/client";

export const CONFIRMAR_CONTEO_MENSUAL = gql`
  mutation ConfirmarConteoMensual($asignacionId: Int!, $confirmadoPor: String!) {
    confirmarConteoMensual(asignacionId: $asignacionId, confirmadoPor: $confirmadoPor) {
      id
      confirmadoConteo
      fechaConfirmacion
      confirmadoPor {
        id
        email
      }
    }
  }
`;