import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message,
  confirmLabel = 'Delete',
  destructive = true,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          {destructive && (
            <div className="p-2 rounded-lg bg-[#FDF6F6] border border-[#E8C5C5] text-[#B83B3B] shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <p className="text-sm text-[#4A4740] leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E2DC]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[#4A4740] bg-white border border-[#D8D4CC] rounded-lg hover:bg-[#F1EFEA] transition-colors whitespace-nowrap disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 ${
              destructive
                ? 'bg-[#B83B3B] hover:bg-[#9C2F2F]'
                : 'bg-[#355482] hover:bg-[#29436A]'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
