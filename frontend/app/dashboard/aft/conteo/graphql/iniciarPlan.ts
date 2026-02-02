import { gql } from "@apollo/client";

export const INICIAR_PLAN = gql`
  mutation IniciarPlan($planId: Int!) {
    iniciarPlanConteo(planId: $planId) {
      id
      estado
      asignacionesMensuales {
        id
        estado
      }
    }
  }
`;