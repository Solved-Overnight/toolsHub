import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Calculator, Beaker, Settings2, History, Printer, HandMetal, FolderOpen, Clock, Search, Trash2, Loader2 } from 'lucide-react'; // Added Search, Trash2, Loader2 icons
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input'; // Added Input component for search
import { DyeingForm } from '../components/DyeingForm';
import { ChemicalItemsTable } from '../components/ChemicalItemsTable';
import { PrintableReport } from '../components/PrintableReport';
import { SettingsDialog } from '../components/SettingsDialog';
import { SaveRecipeDialog } from '../components/SaveRecipeDialog';
import { ViewRecipesDialog } from '../components/ViewRecipesDialog';
import { AlertDialog } from '../components/AlertDialog';
import { SaveOptionsDialog } from '../components/SaveOptionsDialog';
import { PasswordInputDialog } from '../components/PasswordInputDialog'; // New import
import { useToast } from '../components/ui/ToastProvider'; // New imports for Toast - Removed ToastProvider wrapper
import { useReactToPrint } from 'react-to-print';
import type { DyeingFormData, ChemicalItem, Settings, Recipe } from '../types';
import { calculateTotalWater } from '../types';
import { db, auth } from '../lib/firebaseConfig'; // Import Firebase db and auth
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore'; // Import Firestore functions
import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Import onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential

const generateReqId = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `R${year}${randomId}`;
};

const initialChemicalItem: ChemicalItem = {
  itemType: '',
  itemName: '',
  lotNo: '',
  dosing: null,
  shade: null,
  qty: { kg: null, gm: null, mg: null },
  unitPrice: null,
  costing: 0,
  remarks: '',
  highlight: false,
};

const initialFormData: DyeingFormData = {
  reqId: '',
  reqDate: new Date().toISOString().split('T')[0],
  project: '',
  fabricType: '',
  color: '',
  colorMore: '',
  labDipNo: '',
  machineDesc: '',
  machineNo: '',
  remarks: '',
  reelSpeed: '',
  pumpSpeed: '',
  cycleTime: '',
  dyingType: '',
  colorGroup: '',
  lotNo: '',
  gsm: '',
  productMode: 'inhouse',
  workOrder: '',
  fabricQty: '',
  buyer: '',
  batchNo: '',
  batchQty: '',
  orderNo: '',
  fabricWeight: null,
  liquorRatio: null,
  totalWater: null,
  composition: '',
  documentMode: 'draft'
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
};

interface DyeingCalculatorProps {
  user: any; // Firebase User object
}

export function DyeingCalculator({ user }: DyeingCalculatorProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaveRecipeOpen, setIsSaveRecipeOpen] = useState(false);
  const [isSaveOptionsOpen, setIsSaveOptionsOpen] = useState(false);
  const [isViewRecipesOpen, setIsViewRecipesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'confirm'; // Added type
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);
  // const [user, setUser] = useState<any>(null); // State to hold authenticated user - now passed as prop
  const [loadedRecipeId, setLoadedRecipeId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // State for password authorization
  const [isPasswordInputOpen, setIsPasswordInputOpen] = useState(false);
  const [isAuthenticatingPassword, setIsAuthenticatingPassword] = useState(false);
  const [passwordAuthError, setPasswordAuthError] = useState<string | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string; name: string } | null>(null);

  const { showToast } = useToast(); // Initialize useToast

  const [history, setHistory] = useState<Recipe[]>([]); // History now fetched from Firebase

  const [settings, setSettings] = useState<Settings>({
    industryName: 'DyeCalc Industries',
    theme: 'light',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  });

  const [formData, setFormData] = useState<DyeingFormData>({
      ...initialFormData,
      reqId: generateReqId()
  });

  const [chemicalItems, setChemicalItems] = useState<ChemicalItem[]>([
    { ...initialChemicalItem }
  ]);

  // Listen for auth state changes - now handled by App.tsx and passed as prop
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //     if (currentUser) {
  //       console.log("User is authenticated:", currentUser.uid);
  //     } else {
  //       console.log("No user is authenticated.");
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

  // Fetch user-specific recipes from Firebase
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const recipesCollectionRef = collection(db, "users", user.uid, "recipes");
    const q = query(recipesCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRecipes: Recipe[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      setHistory(fetchedRecipes);
    }, (error) => {
      console.error("Error fetching recipes:", error);
      showToast({
        message: "Error fetching recipes from cloud. Please try again.",
        type: 'error',
      });
    });

    return () => unsubscribe();
  }, [user, showToast]);


  useEffect(() => {
    const newTotalWater = calculateTotalWater(formData.fabricWeight, formData.liquorRatio);
    if (newTotalWater !== formData.totalWater) {
        setFormData(prev => ({ ...prev, totalWater: newTotalWater }));
    }
  }, [formData.fabricWeight, formData.liquorRatio, formData.totalWater]);


  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `ChemicalRequisition_${formData.reqId}`,
    onAfterPrint: () => {
      // Add to history when printed - now handled by Firebase save/update
      // const historyItem: Recipe = {
      //   id: formData.reqId,
      //   name: formData.project || `Recipe ${formData.reqId}`,
      //   timestamp: new Date().toISOString(),
      //   formData,
      //   chemicalItems
      // };
      
      // const newHistory = [historyItem, ...history.filter(item => item.id !== formData.reqId)];
      // setHistory(newHistory);
      // localStorage.setItem('dyeingHistory', JSON.stringify(newHistory));
      console.log('Print completed.');
    },
  });

  const handleEditFromHistory = (recipe: Recipe) => {
    setFormData(recipe.formData as DyeingFormData);
    setChemicalItems(recipe.chemicalItems as ChemicalItem[]);
    setLoadedRecipeId(recipe.id); // Set loaded recipe ID for potential updates
    setHasUnsavedChanges(false); // Reset unsaved changes flag
    setActiveTab('form');
  };

  const handlePrintFromHistory = (recipe: Recipe) => {
    // Temporarily set the data for printing
    const currentFormData = formData;
    const currentChemicalItems = chemicalItems;
    
    setFormData(recipe.formData as DyeingFormData);
    setChemicalItems(recipe.chemicalItems as ChemicalItem[]);
    
    // Print after a short delay to ensure state is updated
    setTimeout(() => {
      handlePrint();
      // Restore original data
      setFormData(currentFormData);
      setChemicalItems(currentChemicalItems);
    }, 100);
  };

  const handleDeleteFromHistory = (recipeId: string, recipeName: string) => {
    if (!user || !user.email) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please log in with an email and password to delete recipes.",
        type: 'warning', // Set type for AlertDialog
      });
      return;
    }
    setRecipeToDelete({ id: recipeId, name: recipeName });
    setIsPasswordInputOpen(true);
    setPasswordAuthError(null); // Clear previous errors
  };

  const handlePasswordAuthorization = async (password: string) => {
    if (!user || !user.email || !recipeToDelete) return;

    setIsAuthenticatingPassword(true);
    setPasswordAuthError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      setIsPasswordInputOpen(false); // Close password dialog
      // Now show the final confirmation dialog
      setAlertDialog({
        isOpen: true,
        title: "Confirm Deletion",
        message: `Password authorized. Are you sure you want to delete the recipe "${recipeToDelete.name}"? This action cannot be undone.`,
        type: 'confirm', // Set type for AlertDialog
        onConfirm: async () => {
          try {
            await deleteDoc(doc(db, "users", user.uid, "recipes", recipeToDelete.id));

            // Replaced AlertDialog with Toast for success
            showToast({
              message: `Recipe "${recipeToDelete.name}" deleted successfully!`,
              type: 'success',
            });
            setRecipeToDelete(null); // Clear recipe to delete
          } catch (error) {
            console.error("Failed to delete recipe:", error);
            // Replaced AlertDialog with Toast for error
            showToast({
              message: "Error deleting recipe. Check console for details.",
              type: 'error',
            });
          }
        },
        onCancel: () => {
          setAlertDialog(null);
          setRecipeToDelete(null); // Clear recipe to delete if cancelled
        },
        confirmText: "Delete",
        cancelText: "Cancel",
      });

    } catch (error: any) {
      console.error("Password reauthentication failed:", error);
      let errorMessage = "Password authorization failed. Please try again.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/user-mismatch') {
        errorMessage = "User mismatch. Please log in again.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials. Please check your email and password.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "This action requires a recent login. Please log in again.";
      }
      setPasswordAuthError(errorMessage);
    } finally {
      setIsAuthenticatingPassword(false);
    }
  };

  const handleSaveRecipe = async (recipeName: string) => {
    if (!user) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please ensure you are authenticated to save recipes. Try refreshing the page.",
        type: 'warning',
      });
      return;
    }

    setIsSaving(true);

    const recipe: Recipe = {
      id: generateReqId(), // Firebase will assign its own ID, but we keep this for internal consistency
      name: recipeName,
      timestamp: new Date().toISOString(),
      formData: { ...formData, project: recipeName },
      chemicalItems
    };

    try {
        const docRef = await addDoc(collection(db, "users", user.uid, "recipes"), recipe);
        setLoadedRecipeId(docRef.id); // Set the Firebase-generated ID as the loaded recipe ID
        setHasUnsavedChanges(false);
        // Replaced AlertDialog with Toast for success
        showToast({
          message: `Recipe "${recipeName}" saved successfully to cloud!`,
          type: 'success',
        });
    } catch (error) {
        console.error("Failed to save recipe to Firebase:", error);
        // Replaced AlertDialog with Toast for error
        showToast({
          message: "Error saving recipe to cloud. Check console for details.",
          type: 'error',
        });
    } finally {
        setIsSaving(false);
        setIsSaveRecipeOpen(false);
    }
  };

  const handleLoadRecipe = (recipe: Recipe) => {
    setFormData({
      ...recipe.formData as DyeingFormData,
      reqId: generateReqId(), // Generate a new Req ID when loading a recipe
      reqDate: new Date().toISOString().split('T')[0],
    });
    setChemicalItems(recipe.chemicalItems as ChemicalItem[]);
    setLoadedRecipeId(recipe.id); // Keep the original Firebase ID if loading to update
    setHasUnsavedChanges(false);
    // Replaced AlertDialog with Toast for success
    showToast({
      message: `Recipe "${recipe.name || (recipe.formData as DyeingFormData).project}" loaded successfully!`,
      type: 'success',
    });
  };

  const handleSaveClick = () => {
    if (!user) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please log in to save recipes.",
        type: 'warning',
      });
      return;
    }
    if (loadedRecipeId && hasUnsavedChanges) {
      setIsSaveOptionsOpen(true);
    } else {
      setIsSaveRecipeOpen(true);
    }
  };

  const handleSaveAsNew = () => {
    setLoadedRecipeId(null); // Clear loadedRecipeId to force a new save
    setIsSaveOptionsOpen(false);
    setIsSaveRecipeOpen(true);
  };

  const handleUpdateExisting = async () => {
    if (!loadedRecipeId || !user) return;
    
    setIsSaving(true);
    try {
      // Update the existing document instead of creating a new one
      await updateDoc(doc(db, "users", user.uid, "recipes", loadedRecipeId), {
        name: formData.project,
        timestamp: new Date().toISOString(),
        formData,
        chemicalItems
      });
      
      setHasUnsavedChanges(false);
      // Replaced AlertDialog with Toast for success
      showToast({
        message: "Recipe updated successfully!",
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to update recipe:", error);
      // Replaced AlertDialog with Toast for error
      showToast({
        message: "Error updating recipe. Check console for details.",
        type: 'error',
      });
    } finally {
      setIsSaving(false);
      setIsSaveOptionsOpen(false);
    }
  };
  const handleClear = () => {
    setFormData({
        ...initialFormData,
        reqId: generateReqId()
    });
    setChemicalItems([{ ...initialChemicalItem }]);
    setLoadedRecipeId(null);
    setHasUnsavedChanges(false);
  };

  const handleItemsChange = useCallback((newItems: ChemicalItem[]) => {
      setChemicalItems(newItems);
      if (loadedRecipeId) {
        setHasUnsavedChanges(true);
      }
  }, [loadedRecipeId]);

  // Track form changes
  useEffect(() => {
    if (loadedRecipeId) {
      setHasUnsavedChanges(true);
    }
  }, [formData, loadedRecipeId]);

  const handleReorderItems = useCallback((startIndex: number, endIndex: number) => {
    console.log(`Reordering from index ${startIndex} to ${endIndex}`);
    setChemicalItems(prevItems => {
      const result = Array.from(prevItems);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      console.log('New items order:', result);
      return result;
    });
  }, []);

  const handleOnDragEnd = (result: DropResult) => {
    console.log('onDragEnd triggered:', result);

    if (!result.destination) {
      console.log('Dropped outside a droppable area');
      return;
    }

    if (result.source.index === result.destination.index) {
      console.log('Dropped in the same position');
      return;
    }

    handleReorderItems(result.source.index, result.destination.index);
  };

  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const formData = item.formData as DyeingFormData; // Cast to DyeingFormData for specific fields
    return (
      formData.reqId.toLowerCase().includes(searchLower) ||
      formData.batchNo.toLowerCase().includes(searchLower) ||
      formData.buyer.toLowerCase().includes(searchLower) ||
      formData.color.toLowerCase().includes(searchLower) ||
      formData.fabricType.toLowerCase().includes(searchLower) ||
      formData.machineNo.toLowerCase().includes(searchLower.replace('mc ', '')) || // Allow searching 'mc 18' for '18'
      formatDate(formData.reqDate).toLowerCase().includes(searchLower) // Use formatted date for search
    );
  });


  return (
    <div className="min-h-screen bg-background">
      {/* Header Section - Outside Container */}
      <div className="bg-card text-card-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Chemical Requisition (LAB)</h2>
              <p className="text-muted-foreground mt-1">Create and manage dyeing recipes with precision.</p>
            </div>
            {activeTab === 'form' && (
              <div className="flex items-center space-x-6">
                <span className="text-sm font-medium text-muted-foreground">Req ID:</span>
                <span className="ml-2 text-lg font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {formData.reqId}
                </span>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit mt-4">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'form'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Beaker className="h-4 w-4" />
              Chemical Requisition
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="h-4 w-4" />
              History ({history.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border">
          {activeTab === 'form' ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Chemical Requisition (LAB)</h2>
                  <p className="text-muted-foreground">Create and manage dyeing recipes with precision.</p>
                </div>
                <div className="flex space-x-8">
                  {/* Product Mode */}
                  <div className="flex space-x-4 p-1 bg-muted rounded-lg">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        className="sr-only"
                        name="productMode"
                        value="inhouse"
                        checked={formData.productMode === 'inhouse'}
                        onChange={(e) => setFormData({ ...formData, productMode: e.target.value as 'inhouse' | 'subcontract' })}
                      />
                      <span className={`px-4 py-1 text-sm rounded-md transition ${formData.productMode === 'inhouse' ? 'bg-card shadow-sm text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        Inhouse
                      </span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        className="sr-only"
                        name="productMode"
                        value="subcontract"
                        checked={formData.productMode === 'subcontract'}
                        onChange={(e) => setFormData({ ...formData, productMode: e.target.value as 'inhouse' | 'subcontract' })}
                      />
                      <span className={`px-4 py-1 text-sm rounded-md transition ${formData.productMode === 'subcontract' ? 'bg-card shadow-sm text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        Subcontract
                      </span>
                    </label>
                  </div>
                  
                  {/* Document Mode */}
                  <div className="flex space-x-4 p-1 bg-muted rounded-lg">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        className="sr-only"
                        name="documentMode"
                        value="draft"
                        checked={formData.documentMode === 'draft'}
                        onChange={(e) => setFormData({ ...formData, documentMode: e.target.value as 'draft' | 'final' })}
                      />
                      <span className={`px-4 py-1 text-sm rounded-md transition ${formData.documentMode === 'draft' ? 'bg-card shadow-sm text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        Draft
                      </span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        className="sr-only"
                        name="documentMode"
                        value="final"
                        checked={formData.documentMode === 'final'}
                        onChange={(e) => setFormData({ ...formData, documentMode: e.target.value as 'draft' | 'final' })}
                      />
                      <span className={`px-4 py-1 text-sm rounded-md transition ${formData.documentMode === 'final' ? 'bg-card shadow-sm text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        Final
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <DyeingForm data={formData} onChange={setFormData} />

              <DragDropContext onDragEnd={handleOnDragEnd}>
                <ChemicalItemsTable
                  items={chemicalItems}
                  totalWater={formData.totalWater}
                  fabricWeight={formData.fabricWeight}
                  onItemsChange={handleItemsChange}
                />
              </DragDropContext>

              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <Button variant="outline" onClick={handleClear}>Clear Form</Button>
                <Button onClick={handleSaveClick} className="bg-[#1A3636] hover:bg-green-900 text-white">
                  {loadedRecipeId && hasUnsavedChanges ? 'Save Changes' : 'Save Recipe'}
                </Button>
                <Button onClick={() => setIsViewRecipesOpen(true)} className="bg-[#1A3636] hover:bg-green-900 text-white flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  View Recipes
                </Button>
                <Button onClick={handlePrint} className="bg-[#FF9900] hover:bg-orange-500 text-white flex items-center">
                  <Printer className="h-5 w-5 mr-2" />
                  View/Print
                </Button>
              </div>
            </>
          ) : (
            /* History Tab - Redesigned */
            <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recipe History</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by Req ID, Batch, Buyer, Color, Fabric, MC No..."
                  className="pl-10 pr-4 py-2 border border-input rounded-lg w-80 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary focus:ring-offset-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-lg">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">
                    {searchTerm ? 'No recipes found matching your search criteria.' : 'No history yet'}
                  </p>
                  <p className="text-sm mt-1">
                    Create and print chemical requisitions to see them here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2"> {/* Increased gap to gap-2 for slightly more space */}
                  {/* Table Header */}
                  <div className="grid grid-cols-9 border border-border rounded-lg overflow-hidden bg-gray-200 shadow-md">
                    <div className="p-3 text-center text-sm font-medium text-gray-800 uppercase border-r border-gray-300">Req. No</div>
                    <div className="p-3 text-center text-sm font-medium text-gray-800 uppercase border-r border-gray-300">Date</div>
                    <div className="p-3 text-center text-sm font-medium text-gray-800 uppercase border-r border-gray-300">Buyer</div>
                    <div className="p-3 text-center text-sm font-medium text-gray-800 uppercase border-r border-gray-300">Batch No</div>
                    <div className="p-3 text-center text-sm font-medium text-gray-800 uppercase border-r border-gray-300">Color</div>
                    <div className="p-3 text-center text-sm font-medium text-gray-800 uppercase border-r border-gray-300">Fabric Type</div>
                    <div className="p-3 text-center text-sm font-medium text-gray-800 uppercase border-r border-gray-300">MC No</div>
                    <div className="p-3 text-center text-sm font-medium text-gray-800 uppercase border-r border-gray-300">Quantity</div>
                    <div className="p-3 text-center text-sm font-medium text-gray-800 uppercase">Actions</div>
                  </div>

                  {/* Table Rows */}
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-9 border border-border rounded-lg overflow-hidden bg-background shadow-sm hover:shadow-md hover:bg-[#d3e0fb] hover:text-gray-900 transition-all duration-200 ease-in-out"
                    >
                      <div className="p-3 text-center text-sm font-mono border-r border-border">{(item.formData as DyeingFormData).reqId}</div>
                      <div className="p-3 text-center text-sm border-r border-border">{formatDate((item.formData as DyeingFormData).reqDate)}</div>
                      <div className="p-3 text-center text-sm border-r border-border">{(item.formData as DyeingFormData).buyer || 'N/A'}</div>
                      <div className="p-3 text-center text-sm border-r border-border">{(item.formData as DyeingFormData).batchNo || 'N/A'}</div>
                      <div className="p-3 text-center text-sm border-r border-border">{(item.formData as DyeingFormData).color || 'N/A'}</div>
                      <div className="p-3 text-center text-sm border-r border-border">{(item.formData as DyeingFormData).fabricType || 'N/A'}</div>
                      <div className="p-3 text-center text-sm border-r border-border">{(item.formData as DyeingFormData).machineNo || 'N/A'}</div>
                      <div className="p-3 text-center text-sm border-r border-border">{(item.formData as DyeingFormData).fabricWeight ? `${(item.formData as DyeingFormData).fabricWeight} kg` : 'N/A'}</div>
                      <div className="p-3 flex items-center justify-around gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditFromHistory(item)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Beaker className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrintFromHistory(item)}
                          className="text-foreground hover:text-gray-800 hover:bg-gray-200"
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFromHistory(item.id, item.name || (item.formData as DyeingFormData).project)}
                          className="text-error hover:bg-error/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <PrintableReport ref={printRef} data={formData} chemicalItems={chemicalItems} />
      </div>

      <SaveRecipeDialog
        isOpen={isSaveRecipeOpen}
        onClose={() => setIsSaveRecipeOpen(false)}
        onSave={handleSaveRecipe}
        isSaving={isSaving}
      />

      <SaveOptionsDialog
        isOpen={isSaveOptionsOpen}
        onClose={() => setIsSaveOptionsOpen(false)}
        onSaveAsNew={handleSaveAsNew}
        onUpdateExisting={handleUpdateExisting}
        isSaving={isSaving}
        recipeName={formData.project}
      />

      <ViewRecipesDialog
        isOpen={isViewRecipesOpen}
        onClose={() => setIsViewRecipesOpen(false)}
        onRetrieve={handleLoadRecipe}
        user={user}
        collectionPath="recipes"
        itemType="recipe"
      />

      {alertDialog && (
        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog(null)}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type} // Pass the type prop
          onConfirm={alertDialog.onConfirm}
          onCancel={alertDialog.onCancel}
          confirmText={alertDialog.confirmText}
          cancelText={alertDialog.cancelText}
        />
      )}

      {isPasswordInputOpen && (
        <PasswordInputDialog
          isOpen={isPasswordInputOpen}
          onClose={() => {
            setIsPasswordInputOpen(false);
            setRecipeToDelete(null);
            setPasswordAuthError(null);
          }}
          onConfirm={handlePasswordAuthorization}
          title="Authorize Deletion"
          message="Please enter your password to authorize the deletion of this recipe."
          isAuthenticating={isAuthenticatingPassword}
          error={passwordAuthError}
        />
      )}
    </div>
  );
}
