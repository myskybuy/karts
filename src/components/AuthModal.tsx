"use client";

import AuthPanel, { AuthUser } from "./AuthPanel";

type AuthModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
  onSuccess: (user: AuthUser) => void;
};

export default function AuthModal({
  open,
  title = "Login required",
  message = "Please log in or create an account to continue checkout.",
  onClose,
  onSuccess,
}: AuthModalProps) {
  // Unmounting when closed means <AuthPanel> starts from a clean slate every time
  // the modal is reopened — no manual state reset needed.
  if (!open) return null;

  return (
    <div className="auth-modal-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal">
        {onClose ? (
          <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        ) : null}
        <AuthPanel title={title} message={message} onSuccess={onSuccess} />
      </div>
    </div>
  );
}
