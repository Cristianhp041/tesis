"use client";

import { useState } from "react";
import { useQuery, useMutation } from '@apollo/client/react';
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { 
  Document, 
  DocumentFormData,
  GetDocumentsResponse,
  GetDocumentsVariables,
  DeleteDocumentResponse,
  DeleteDocumentVariables
} from "../types/document.types";
import { GET_DOCUMENTS, DELETE_DOCUMENT } from "../graphql/documents.queries";
import { getFilenameFromUrl } from "../utils/formatters";
import DocumentCard from "../components/DocumentCard";
import DocumentFilters from "../components/DocumentFilters";
import EmptyState from "../components/EmptyState";
import UploadModalEspecifico from "../components/UploadModalEspecifico";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

export default function DocumentosEspecificosPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; documentId: string; documentName: string }>({
    isOpen: false,
    documentId: "",
    documentName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, loading, refetch } = useQuery<GetDocumentsResponse, GetDocumentsVariables>(
    GET_DOCUMENTS,
    {
      variables: {
        filters: {
          tipo: 'ESPECIFICO',
          ...(searchTerm && { busqueda: searchTerm }),
        }
      }
    }
  );

  const [deleteDocument] = useMutation<DeleteDocumentResponse, DeleteDocumentVariables>(
    DELETE_DOCUMENT
  );

  const documents: Document[] = data?.documents || [];

  const handleUpload = async (file: File, formData: DocumentFormData) => {
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('input', JSON.stringify({
        nombre: formData.nombre,
        tipo: 'ESPECIFICO',
        evento: formData.evento,
        subidoPor: formData.subidoPor,
      }));

      const response = await fetch('http://localhost:3001/documents/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) throw new Error('Error al subir documento');

      toast.success('✓ Documento subido correctamente');
      refetch();
    } catch {
      toast.error('✗ Error al subir el documento');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const filename = getFilenameFromUrl(doc.url);
      const url = `http://localhost:3001/uploads/documents/${filename}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const downloadName = `${doc.nombre}${doc.extension}`;
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('✓ Documento descargado');
    } catch {
      toast.error('✗ Error al descargar el documento');
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    setDeleteModal({
      isOpen: true,
      documentId: id,
      documentName: nombre,
    });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument({ variables: { id: deleteModal.documentId } });
      toast.success('✓ Documento eliminado');
      refetch();
      setDeleteModal({ isOpen: false, documentId: "", documentName: "" });
    } catch {
      toast.error('✗ Error al eliminar documento');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Documentos Específicos
          </h1>
          <p className="text-slate-500">
            Actas de responsabilidad 
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
        >
          <Upload size={20} />
          Subir Documento
        </button>
      </div>

      <div className="mb-4">
        <DocumentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showMonthFilter={false}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-purple-100"
            >
              <DocumentCard
                document={doc}
                onDownload={handleDownload}
                onDelete={(id) => handleDelete(id, doc.nombre)}
              />
            </div>
          ))}
        </div>
      )}

      <UploadModalEspecifico
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, documentId: "", documentName: "" })}
        onConfirm={confirmDelete}
        documentName={deleteModal.documentName}
        isDeleting={isDeleting}
      />
    </div>
  );
}