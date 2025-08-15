import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';

interface SaveRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipeName: string) => Promise<void>;
  isSaving: boolean;
}

export const SaveRecipeDialog: React.FC<SaveRecipeDialogProps> = ({ isOpen, onClose, onSave, isSaving }) => {
  const [recipeName, setRecipeName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSaveClick = async () => {
    if (recipeName.trim()) {
      setError(null);
      await onSave(recipeName.trim());
      setRecipeName('');
    } else {
      setError('Please enter a recipe name.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Recipe Template</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="recipeName" className="text-right">
              Recipe Name
            </label>
            <input
              id="recipeName"
              value={recipeName}
              onChange={(e) => {
                setRecipeName(e.target.value);
                if (error) setError(null);
              }}
              className="col-span-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Basic Cotton Dyeing"
            />
          </div>
          {error && <p className="col-span-4 text-right text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSaveClick} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
