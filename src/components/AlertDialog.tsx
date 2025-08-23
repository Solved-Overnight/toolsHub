import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Info, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react'; // Changed TriangleAlert to AlertTriangle

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const iconMap = {
  info: <Info className="h-6 w-6 text-blue-500" />,
  success: <CheckCircle className="h-6 w-6 text-success" />,
  warning: <AlertTriangle className="h-6 w-6 text-warning" />, // Changed TriangleAlert to AlertTriangle
  error: <XCircle className="h-6 w-6 text-error" />,
  confirm: <HelpCircle className="h-6 w-6 text-primary" />,
};

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}: AlertDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 rounded-lg shadow-xl p-6 max-w-md mx-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            {iconMap[type]}
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">{title}</DialogTitle>
          <DialogDescription className="text-gray-700 text-base leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3 mt-6">
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-gray-700 hover:bg-gray-100"
            >
              {cancelText || 'Cancel'}
            </Button>
          )}
          {onConfirm && (
            <Button
              variant="outline"
              onClick={onConfirm}
              className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-100"
            >
              {confirmText || 'Confirm'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
