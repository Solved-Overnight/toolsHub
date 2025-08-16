import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Trash2, Calendar, Beaker, Palette, Loader2, FolderOpen, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Recipe } from '../types';
import { db, auth } from '../lib/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface ViewRecipesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrieve: (recipe: Recipe) => void;
}

export const ViewRecipesDialog: React.FC<ViewRecipesDialogProps> = ({
  isOpen,
  onClose,
  onRetrieve,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      loadRecipes();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const filtered = recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.formData.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.formData.fabricType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.formData.buyer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
  }, [recipes, searchTerm]);

  const loadRecipes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'recipes'));
      const loadedRecipes: Recipe[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Recipe;
        loadedRecipes.push({ ...data, id: doc.id });
      });
      
      // Sort by timestamp (newest first)
      loadedRecipes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setRecipes(loadedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteDoc(doc(db, 'recipes', recipeId));
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleRetrieve = (recipe: Recipe) => {
    onRetrieve(recipe);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Recipe Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search recipes by name, color, fabric type, or buyer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-8 w-8 text-primary" />
                </motion.div>
                <span className="ml-3 text-muted-foreground">Loading recipes...</span>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg font-medium">
                  {searchTerm ? 'No recipes found matching your search.' : 'No recipes saved yet.'}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {!searchTerm && 'Create your first recipe using the Dyeing Calculator.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
                            {recipe.name || recipe.formData.project || 'Untitled Recipe'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(recipe.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(recipe.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex flex-wrap gap-2">
                          {recipe.formData.color && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              <Palette className="h-3 w-3" />
                              {recipe.formData.color}
                            </span>
                          )}
                          {recipe.formData.fabricType && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {recipe.formData.fabricType}
                            </span>
                          )}
                          {recipe.chemicalItems.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              <Beaker className="h-3 w-3" />
                              {recipe.chemicalItems.length} items
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Buyer:</strong> {recipe.formData.buyer || 'N/A'}</p>
                          <p><strong>Batch:</strong> {recipe.formData.batchNo || 'N/A'}</p>
                          {recipe.formData.fabricWeight && (
                            <p><strong>Weight:</strong> {recipe.formData.fabricWeight} kg</p>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRetrieve(recipe)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Load Recipe
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Recipe</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete this recipe? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteRecipe(deleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};