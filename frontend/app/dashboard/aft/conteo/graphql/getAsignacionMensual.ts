import { gql } from "@apollo/client";

export const GET_ASIGNACION_MENSUAL = gql`
  query GetAsignacionMensual($id: Int!) {
    asignacionMensual(id: $id) {
      id
      mes
      nombreMes
      mesCalendario
      anno
      estado
      porcentajeAsignado
      cantidadAsignada
      criterioAsignacion
      fechaInicio
      fechaLimite
      activosContados
      activosEncontrados
      activosFaltantes
      activosConDiscrepancias
      porcentajeProgreso
      tasaEncontrados
      confirmadoConteo
      confirmadoPorId
      fechaConfirmacion
      estaTodoContado
      confirmadoPor {
        id
        email
      }
    }
  }
`;