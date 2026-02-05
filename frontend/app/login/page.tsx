"use client";

import { useState } from "react";
import InfoPanel from "./components/InfoPane";
import LoginForm from "./components/Loginform";
import ForgotPasswordModal from "./components/Forgotpasswordmodal";
import ResetPasswordModal from "./components/Resetpasswordmodal";

export default function LoginPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleForgotPasswordSuccess = (emailSubmitted: string) => {
    setResetEmail(emailSubmitted);
    setShowForgotPassword(false);
    setShowResetPassword(true);
  };

  const handleResetPasswordSuccess = () => {
    setShowResetPassword(false);
    setShowSuccess(true);
    setResetEmail("");

    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0 min-h-[600px]">
          <InfoPanel />

          <div className="p-12 flex flex-col justify-center bg-slate-50">
            <LoginForm
              onForgotPassword={() => setShowForgotPassword(true)}
              showSuccessMessage={showSuccess}
            />
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={handleForgotPasswordSuccess}
      />

      <ResetPasswordModal
        open={showResetPassword}
        email={resetEmail}
        onClose={() => setShowResetPassword(false)}
        onSuccess={handleResetPasswordSuccess}
      />
    </div>
  );
}