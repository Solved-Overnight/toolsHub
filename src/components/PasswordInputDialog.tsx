import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'; // Assuming these are available or will be created
import { Button } from './ui/button';
import { Input } from './ui/input'; // Assuming Input component is available
import { Loader2, Lock } from 'lucide-react';

interface PasswordInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
  message: string;
  isAuthenticating: boolean;
  error: string | null;
}

export function PasswordInputDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isAuthenticating,
  error,
}: PasswordInputDialogProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 rounded-lg shadow-xl p-6 max-w-md mx-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">{title}</DialogTitle>
          <DialogDescription className="text-gray-700 text-base leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-900 bg-gray-50"
            disabled={isAuthenticating}
          />
          {error && <p className="text-error text-sm text-center">{error}</p>}
          <DialogFooter className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isAuthenticating}
              className="text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline" // Using outline to match the image's white button style
              disabled={isAuthenticating || !password}
              className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-100" // Override with specific light theme styles
            >
              {isAuthenticating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
