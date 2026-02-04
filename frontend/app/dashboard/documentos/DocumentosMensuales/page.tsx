"use client";

import { useState } from "react";
import { useQuery, useMutation } from '@apollo/client/react';
import { Calendar, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { 
  Document, 
  DocumentFormData,
  GetDocumentsResponse,
  GetDocumentsVariables,
  DeleteDocumentResponse,
  DeleteDocumentVariables,
  CreateTextDocumentResponse,
  CreateTextDocumentVariables,
  UpdateTextDocumentResponse,
  UpdateTextDocumentVariables
} from "../types/document.types";
import { 
  GET_DOCUMENTS, 
  DELETE_DOCUMENT,
  CREATE_TEXT_DOCUMENT,
  UPDATE_TEXT_DOCUMENT
} from "../graphql/documents.queries";
import { formatMonthYear, getFilenameFromUrl } from "../utils/formatters";
import DocumentCard from "../components/DocumentCard";
import DocumentFilters from "../components/DocumentFilters";
import EmptyState from "../components/EmptyState";
import UploadModalMensual from "../components/UploadModalMensual";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import CreateTextDocumentModal, { TextDocumentData } from "../components/Createtextdocumentmodal";
import ViewDocumentModal from "../components/Viewdocumentmodal";
import EditTextDocumentModal, { EditTextDocumentData } from "../components/Edittextdocumentmodal";

export default function DocumentosMensualesPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateTextModal, setShowCreateTextModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; documentId: string; documentName: string }>({
    isOpen: false,
    documentId: "",
    documentName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [editDocument, setEditDocument] = useState<Document | null>(null);

  const { data, loading, refetch } = useQuery<GetDocumentsResponse, GetDocumentsVariables>(
    GET_DOCUMENTS,
    {
      variables: {
        filters: {
          tipo: 'MENSUAL',
          ...(selectedMonth && { mes: selectedMonth }),
          ...(searchTerm && { busqueda: searchTerm }),
        }
      }
    }
  );

  const [deleteDocument] = useMutation<DeleteDocumentResponse, DeleteDocumentVariables>(
    DELETE_DOCUMENT
  );

  const [createTextDocument] = useMutation<CreateTextDocumentResponse, CreateTextDocumentVariables>(
    CREATE_TEXT_DOCUMENT
  );

  const [updateTextDocument] = useMutation<UpdateTextDocumentResponse, UpdateTextDocumentVariables>(
    UPDATE_TEXT_DOCUMENT
  );

  const documents: Document[] = data?.documents || [];

  const handleUpload = async (file: File, formData: DocumentFormData) => {
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('input', JSON.stringify({
        nombre: formData.nombre,
        tipo: 'MENSUAL',
        mes: formData.mes,
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

  const handleCreateText = async (data: TextDocumentData) => {
    try {
      await createTextDocument({
        variables: {
          input: {
            nombre: data.nombre,
            tipo: 'MENSUAL',
            contenido: data.contenido,
            mes: data.mes,
            subidoPor: data.subidoPor,
          }
        }
      });

      toast.success('✓ Documento creado correctamente');
      refetch();
    } catch {
      toast.error('✗ Error al crear el documento');
    }
  };

  const handleEditText = async (id: string, data: EditTextDocumentData) => {
    try {
      await updateTextDocument({
        variables: {
          id,
          input: {
            nombre: data.nombre,
            contenido: data.contenido,
            mes: data.mes,
          }
        }
      });

      toast.success('✓ Documento actualizado correctamente');
      refetch();
    } catch {
      toast.error('✗ Error al actualizar el documento');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      if (doc.esTextoWeb) {
        const blob = new Blob([doc.contenido || ''], { type: 'text/plain' });
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadName = `${doc.nombre}.txt`;
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } else {
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
      }
      
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

  const groupedDocuments = documents.reduce((acc, doc) => {
    const month = doc.mes || 'Sin mes';
    if (!acc[month]) acc[month] = [];
    acc[month].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Documentos Mensuales
          </h1>
          <p className="text-slate-500">
            Planes de trabajo con periodicidad mensual
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateTextModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-lg transition"
          >
            <FileText size={20} />
            Crear Texto
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition"
          >
            <Upload size={20} />
            Subir Archivo
          </button>
        </div>
      </div>

      <div className="mb-4">
        <DocumentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          showMonthFilter
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : Object.keys(groupedDocuments).length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, docs]) => (
              <div key={month} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
                  <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <Calendar size={20} />
                    {formatMonthYear(month)}
                    <span className="text-sm font-normal text-blue-600">
                      ({docs.length} documento{docs.length !== 1 ? 's' : ''})
                    </span>
                  </h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {docs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      onView={setViewDocument}
                      onDownload={handleDownload}
                      onEdit={doc.esTextoWeb ? setEditDocument : undefined}
                      onDelete={(id) => handleDelete(id, doc.nombre)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <UploadModalMensual
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      <CreateTextDocumentModal
        isOpen={showCreateTextModal}
        onClose={() => setShowCreateTextModal(false)}
        onSave={handleCreateText}
        documentType="MENSUAL"
      />

      <ViewDocumentModal
        isOpen={!!viewDocument}
        onClose={() => setViewDocument(null)}
        document={viewDocument}
      />

      <EditTextDocumentModal
        isOpen={!!editDocument}
        onClose={() => setEditDocument(null)}
        onSave={handleEditText}
        document={editDocument}
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