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
      esTextoWeb
      contenido
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

export const CREATE_TEXT_DOCUMENT = gql`
  mutation CreateTextDocument($input: CreateTextDocumentInput!) {
    createTextDocument(input: $input) {
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
      esTextoWeb
      contenido
    }
  }
`;

export const UPDATE_TEXT_DOCUMENT = gql`
  mutation UpdateTextDocument($id: String!, $input: UpdateTextDocumentInput!) {
    updateTextDocument(id: $id, input: $input) {
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
      esTextoWeb
      contenido
    }
  }
`;