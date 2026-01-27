import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      nombre
    }
  }
`;

export interface GetMeResponse {
  me: {
    id: number;
    email: string;
    nombre: string;
  };
}