import { gql } from "@apollo/client";

export const CREATE_AFT = gql`
  mutation CreateAft($data: CreateAftDto!) {
    createAft(data: $data) {
      id
      rotulo
      nombre
      area {
        id
        nombre
      }
      subclasificacion {
        id
        nombre
      }
    }
  }
`;
