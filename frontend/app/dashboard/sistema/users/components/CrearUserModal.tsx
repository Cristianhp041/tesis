"use client";

import { useState } from "react";
import { X } from "lucide-react";
import CrearUserForm from "./CrearUserForm";
import VerificarEmailModal from "./VerificarEmailModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CrearUserModal({ open, onClose }: Props) {
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const handleUserCreated = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
    setShowVerification(true);
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
    setUserEmail("");
    setUserName("");
    onClose();
  };

  if (!open) return null;

  if (showVerification) {
    return (
      <VerificarEmailModal
        open={showVerification}
        email={userEmail}
        userName={userName}
        onClose={handleVerificationClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Crear usuario
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CrearUserForm onSuccess={handleUserCreated} onCancel={onClose} />
      </div>
    </div>
  );
}