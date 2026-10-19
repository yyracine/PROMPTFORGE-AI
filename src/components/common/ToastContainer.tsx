import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useWorkspace();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'warning'
            ? AlertTriangle
            : XCircle;
        const iconColor =
          toast.type === 'success'
            ? 'text-[var(--status-success)]'
            : toast.type === 'warning'
            ? 'text-[var(--status-warning)]'
            : 'text-[var(--status-error)]';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-md text-sm text-[var(--text-main)]"
            role="status"
          >
            <div className="flex items-start gap-2.5">
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-main)] shrink-0"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
