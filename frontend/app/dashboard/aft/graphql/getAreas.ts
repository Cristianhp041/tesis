import { gql } from "@apollo/client";

export const GET_AREAS = gql`
  query {
    areas {
      id
      nombre
    }
  }
`;
