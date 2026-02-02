import { gql } from "@apollo/client";

export const FINALIZAR_PLAN = gql`
  mutation FinalizarPlan($planId: Int!, $motivo: String) {
    finalizarPlanConteo(planId: $planId, motivo: $motivo) {
      id
      estado
      observaciones
    }
  }
`;

export const REDISTRIBUIR_NUEVOS_ACTIVOS = gql`
  mutation RedistribuirNuevosActivos($planId: Int!) {
    redistribuirNuevosActivos(planId: $planId) {
      id
      totalActivos
      asignacionesMensuales {
        id
        cantidadAsignada
        criterioAsignacion
      }
    }
  }
`;

export const CONTAR_NUEVOS_SIN_ASIGNAR = gql`
  query ContarNuevosSinAsignar($planId: Int!) {
    contarActivosNuevosSinAsignar(planId: $planId)
  }
`;