import { gql } from "@apollo/client";

export const LISTAR_PLANES_CONTEO = gql`
  query ListarPlanesConteo {
    listarPlanesConteo {
      id
      anno
      fechaInicio
      fechaFin
      estado
      totalActivos
      activosPorMes
      activosContados
      activosEncontrados
      activosFaltantes
      activosConDiscrepancias
      porcentajeProgreso
      createdAt
      createdBy {
        id
        email
      }
    }
  }
`;