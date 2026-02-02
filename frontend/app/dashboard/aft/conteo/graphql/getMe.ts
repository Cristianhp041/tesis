import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      role
    }
  }
`;

export interface GetMeResponse {
  me: {
    id: number;
    email: string;
    role: string;
  };
}