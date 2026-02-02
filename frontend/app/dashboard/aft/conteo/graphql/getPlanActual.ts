import { gql } from "@apollo/client";

export const GET_PLAN_ACTUAL = gql`
  query GetPlanActual {
    planConteoActual {
      id
      anno
      fechaInicio
      fechaFin
      estado
      totalActivos
      activosPorMes
      toleranciaMin
      toleranciaMax
      activosContados
      activosEncontrados
      activosFaltantes
      activosConDiscrepancias
      porcentajeProgreso
      asignacionesMensuales {
        id
        mes
        nombreMes
        anno
        estado
        cantidadAsignada
        activosContados
        activosEncontrados
        activosFaltantes
        activosConDiscrepancias
        porcentajeProgreso
        fechaInicio
        fechaLimite
        confirmadoConteo
      }
    }
  }
`;