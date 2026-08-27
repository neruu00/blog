'use client';

import Button from '@/components/ui/Button';

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
      <h3 id="modal-title" className="text-xl font-bold text-gray-900">
        {title}
      </h3>
      <p id="modal-description" className="mt-2 text-gray-500">
        {message}
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? 'destructive' : 'primary'}
          size="sm"
          className="font-bold"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </div>
  );
}
