import { gql } from "@apollo/client";

export const DESACTIVAR_TRABAJADORES_MASIVO = gql`
  mutation DesactivarTrabajadoresMasivo($data: BulkTrabajadorInput!) {
    desactivarTrabajadoresMasivo(data: $data) {
      id
      nombre
      apellidos
      activo
    }
  }
`;