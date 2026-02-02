import { gql } from "@apollo/client";

export const REGISTRAR_CONTEO = gql`
  mutation RegistrarConteo($input: RegistrarConteoInput!) {
    registrarConteo(input: $input) {
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