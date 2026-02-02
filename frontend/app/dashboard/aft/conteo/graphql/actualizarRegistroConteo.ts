import { gql } from "@apollo/client";

export const ACTUALIZAR_REGISTRO_CONTEO = gql`
  mutation ActualizarRegistroConteo($input: ActualizarRegistroConteoInput!) {
    actualizarRegistroConteo(input: $input) {
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
      }
    }
  }
`;