import { gql } from "@apollo/client";

export const GET_REGISTROS_DEL_MES = gql`
  query GetRegistrosDelMes($asignacionMensualId: Int!) {
    registrosConteoPorMes(asignacionMensualId: $asignacionMensualId) {
      id
      encontrado
      ubicacionEncontrada
      estadoEncontrado
      areaEncontrada
      tieneDiscrepancia
      tipoDiscrepancia
      descripcionDiscrepancia
      comentarios
      fechaConteo
      estado
      aft {
        id
        rotulo
        nombre
        area {
          nombre
        }
        subclasificacion {
          nombre
        }
      }
      contadoPor {
        email
      }
    }
  }
`;