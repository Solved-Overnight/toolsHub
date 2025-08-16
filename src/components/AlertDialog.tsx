import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

const getIcon = (variant: string, title: string) => {
  if (variant === 'destructive') return AlertTriangle;
  if (title.toLowerCase().includes('success')) return CheckCircle;
  if (title.toLowerCase().includes('error')) return XCircle;
  return Info;
};

const getIconColor = (variant: string, title: string) => {
  if (variant === 'destructive') return 'text-destructive';
  if (title.toLowerCase().includes('success')) return 'text-green-600';
  if (title.toLowerCase().includes('error')) return 'text-destructive';
  return 'text-primary';
};
export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'default',
}) => {
  const Icon = getIcon(variant, title);
  const iconColor = getIconColor(variant, title);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </motion.div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          {onConfirm && (
            <Button variant="outline" onClick={onClose} className="flex-1">
              {cancelText}
            </Button>
          )}
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className="flex-1"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
