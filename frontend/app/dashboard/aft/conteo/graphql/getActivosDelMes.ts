import { gql } from "@apollo/client";

export const GET_ACTIVOS_DEL_MES = gql`
  query GetActivosDelMes($asignacionId: Int!) {
    activosDelMes(asignacionId: $asignacionId) {
      id
      codigo
      descripcion
      ubicacion
      estado
      areaNombre
      subclasificacionNombre
      yaContado
      activo
    }
  }
`;