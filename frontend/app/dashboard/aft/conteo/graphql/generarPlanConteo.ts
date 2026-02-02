import { gql } from "@apollo/client";

export const GENERAR_PLAN_CONTEO = gql`
  mutation GenerarPlanConteo($input: GenerarPlanInput!) {
    generarPlanConteo(input: $input) {
      id
      anno
      fechaInicio
      fechaFin
      estado
      totalActivos
      activosPorMes
      toleranciaMin
      toleranciaMax
      asignacionesMensuales {
        id
        mes
        nombreMes
        anno
        cantidadAsignada
        porcentajeAsignado
        criterioAsignacion
        fechaInicio
        fechaLimite
        estado
      }
      createdBy {
        id
        email
      }
    }
  }
`;