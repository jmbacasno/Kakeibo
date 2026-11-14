import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message,
  confirmLabel = 'Delete',
  destructive = true,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          {destructive && (
            <div className="p-2 rounded-lg bg-danger-bg border border-danger-line text-danger-accent shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <p className="text-sm text-ink-secondary leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-line-strong rounded-lg hover:bg-subtle transition-colors whitespace-nowrap disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 ${
              destructive ? 'bg-danger-accent hover:bg-danger-hover' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
