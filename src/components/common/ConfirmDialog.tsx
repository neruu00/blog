'use client';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  isDanger = false,
}: ConfirmDialogProps) {
  return (
    <div className="flex flex-col">
      <h3 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p id="modal-description" className="mt-2 text-gray-600 dark:text-neutral-400">
        {message}
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors ${
            isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
