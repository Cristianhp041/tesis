export interface Document {
  id: string;
  nombre: string;
  nombreOriginal: string;
  tipo: string;
  url: string;
  tamano: number;
  extension: string;
  descripcion: string;
  mes?: string;
  evento?: string;
  subidoPor: string;
  fechaSubida: string;
}

export interface DocumentFormData {
  nombre: string;
  mes?: string;
  evento?: string;
  descripcion: string;
  subidoPor: string;
}

export type DocumentType = 'MENSUAL' | 'ESPECIFICO';

export interface GetDocumentsResponse {
  documents: Document[];
}

export interface GetDocumentsVariables {
  filters?: {
    tipo?: string;
    mes?: string;
    busqueda?: string;
  };
}

export interface DeleteDocumentResponse {
  deleteDocument: {
    message: string;
  };
}

export interface DeleteDocumentVariables {
  id: string;
}