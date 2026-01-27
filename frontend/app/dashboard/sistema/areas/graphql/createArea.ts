import { gql } from "@apollo/client";

export const CREATE_AREA = gql`
  mutation CreateArea($data: CreateAreaDto!) {
  createArea(data: $data) {
    id
    nombre
    activo
  }
}

`;
