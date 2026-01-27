import { FileText } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <FileText size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-600">
          No hay documentos resguardados
        </p>
      </div>
    </div>
  );
}