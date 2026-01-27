import { gql } from '@apollo/client';

export const GET_DOCUMENTS = gql`
  query GetDocuments($filters: FilterDocumentsInput) {
    documents(filters: $filters) {
      id
      nombre
      nombreOriginal
      tipo
      url
      tamano
      extension
      descripcion
      mes
      evento
      subidoPor
      fechaSubida
    }
  }
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: String!) {
    deleteDocument(id: $id) {
      message
    }
  }
`;