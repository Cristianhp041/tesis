import { gql } from "@apollo/client";

export const GET_DISCREPANCIAS = gql`
  query GetDiscrepancias($asignacionMensualId: Int!) {
    discrepanciasPorMes(asignacionMensualId: $asignacionMensualId) {
      id
      encontrado
      ubicacionEncontrada
      areaEncontrada
      tieneDiscrepancia
      tipoDiscrepancia
      descripcionDiscrepancia
      comentarios
      fechaConteo
      aft {
        id
        rotulo
        nombre
        area {
          nombre
        }
      }
      contadoPor {
        email
      }
    }
  }
`;