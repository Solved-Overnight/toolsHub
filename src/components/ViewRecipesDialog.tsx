import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertDialog } from './AlertDialog';
import type { Recipe } from '../types';
import { db } from '../lib/firebaseConfig'; // Import Firebase db
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'; // Import Firestore functions

interface ViewRecipesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrieve: (recipe: Recipe) => void;
}

export const ViewRecipesDialog: React.FC<ViewRecipesDialogProps> = ({ isOpen, onClose, onRetrieve }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [recipeToDeleteId, setRecipeToDeleteId] = useState<string | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const fetchedRecipes: Recipe[] = querySnapshot.docs.map(doc => ({
        ...(doc.data() as Recipe),
        id: doc.id
      }));
      setRecipes(fetchedRecipes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error("Failed to load recipes from Firebase:", error);
      setRecipes([]);
      setAlertDialog({
        isOpen: true,
        title: "Error",
        message: "Failed to load recipes. Please check console for details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
      setSelectedRecipeId(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredRecipes = useMemo(() => {
    if (!searchTerm) {
      return recipes;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return recipes.filter(recipe =>
      (recipe.formData.project?.toLowerCase().includes(lowerCaseSearchTerm) ||
      recipe.id.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [recipes, searchTerm]);

  const handleRetrieveClick = () => {
    if (selectedRecipeId) {
      const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
      if (selectedRecipe) {
        onRetrieve(selectedRecipe);
        onClose();
      }
    } else {
      setAlertDialog({
        isOpen: true,
        title: "Selection Required",
        message: "Please select a recipe to retrieve.",
      });
    }
  };

  const confirmDelete = (id: string) => {
    setRecipeToDeleteId(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (recipeToDeleteId) {
      setIsDeletingId(recipeToDeleteId);
      try {
        await deleteDoc(doc(db, "recipes", recipeToDeleteId));
        const updatedRecipes = recipes.filter(r => r.id !== recipeToDeleteId);
        setRecipes(updatedRecipes);
        if (selectedRecipeId === recipeToDeleteId) {
          setSelectedRecipeId(null);
        }
        setAlertDialog({
          isOpen: true,
          title: "Success",
          message: "Recipe deleted successfully from cloud!",
        });
      } catch (error) {
        console.error("Failed to delete recipe from Firebase:", error);
        setAlertDialog({
          isOpen: true,
          title: "Error",
          message: "Error deleting recipe from cloud. Check console for details.",
        });
      } finally {
        setIsDeletingId(null);
        setRecipeToDeleteId(null);
        setIsConfirmDeleteOpen(false);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>View Saved Recipes</DialogTitle>
            <DialogDescription>
              Select a recipe template to load its data into the form.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              type="text"
              placeholder="Search recipes by project name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
        </DialogContent>
      </Dialog>

      <AlertDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="Confirm Deletion"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        onConfirm={handleDeleteConfirmed}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {alertDialog && (
        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog(null)}
          title={alertDialog.title}
          message={alertDialog.message}
        />
      )}
    </>
  );
}
