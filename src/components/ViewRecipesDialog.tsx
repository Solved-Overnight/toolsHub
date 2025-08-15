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
            <div className="max-h-[350px] overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredRecipes.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                  {searchTerm ? "No matching recipes found." : "No recipes saved yet."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {filteredRecipes.map((recipe) => (
                    <li
                      key={recipe.id}
                      className={`flex items-center justify-between p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-200 ease-in-out ${
                        selectedRecipeId === recipe.id
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
                          : 'bg-white hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRecipeId(recipe.id)}
                    >
                      <div className="flex-grow">
                        <p className="font-semibold text-lg text-gray-800">{recipe.formData.project || 'Untitled Recipe'}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Saved: {new Date(recipe.timestamp).toLocaleDateString()} at {new Date(recipe.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Recipe ID: {recipe.id}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(recipe.id);
                        }}
                        className="ml-4 shrink-0 w-[80px]"
                        disabled={isDeletingId === recipe.id}
                      >
                        {isDeletingId === recipe.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleRetrieveClick} disabled={!selectedRecipeId}>Retrieve</Button>
          </DialogFooter>
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
