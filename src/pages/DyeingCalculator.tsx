import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Calculator, Beaker, Settings2, History, Printer, HandMetal, FolderOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { DyeingForm } from '../components/DyeingForm';
import { ChemicalItemsTable } from '../components/ChemicalItemsTable';
import { PrintableReport } from '../components/PrintableReport';
import { SettingsDialog } from '../components/SettingsDialog';
import { SaveRecipeDialog } from '../components/SaveRecipeDialog';
import { ViewRecipesDialog } from '../components/ViewRecipesDialog';
import { AlertDialog } from '../components/AlertDialog';
import { useReactToPrint } from 'react-to-print';
import type { DyeingFormData, ChemicalItem, Settings, Recipe } from '../types';
import { calculateTotalWater } from '../types';
import { db, auth } from '../lib/firebaseConfig'; // Import Firebase db and auth
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore'; // Import Firestore functions
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged

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
  composition: ''
};


export function DyeingCalculator() {
  const printRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaveRecipeOpen, setIsSaveRecipeOpen] = useState(false);
  const [isViewRecipesOpen, setIsViewRecipesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; } | null>(null);
  const [user, setUser] = useState<any>(null); // State to hold authenticated user

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

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User is authenticated:", currentUser.uid);
      } else {
        console.log("No user is authenticated.");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const newTotalWater = calculateTotalWater(formData.fabricWeight, formData.liquorRatio);
    if (newTotalWater !== formData.totalWater) {
        setFormData(prev => ({ ...prev, totalWater: newTotalWater }));
    }
  }, [formData.fabricWeight, formData.liquorRatio, formData.totalWater]);


  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `ChemicalRequisition_${formData.reqId}`,
  });

  const handleSaveRecipe = async (recipeName: string) => {
    if (!user) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please ensure you are authenticated to save recipes. Try refreshing the page.",
      });
      return;
    }

    setIsSaving(true);

    const recipe: Recipe = {
      id: generateReqId(),
      name: recipeName,
      timestamp: new Date().toISOString(),
      formData: { ...formData, project: recipeName },
      chemicalItems
    };

    try {
        await addDoc(collection(db, "recipes"), recipe);
        setAlertDialog({
          isOpen: true,
          title: "Success",
          message: `Recipe "${recipeName}" saved successfully to cloud!`,
        });
    } catch (error) {
        console.error("Failed to save recipe to Firebase:", error);
        setAlertDialog({
          isOpen: true,
          title: "Error",
          message: "Error saving recipe to cloud. Check console for details.",
        });
    } finally {
        setIsSaving(false);
        setIsSaveRecipeOpen(false);
    }
  };

  const handleLoadRecipe = (recipe: Recipe) => {
    setFormData({
      ...recipe.formData,
      reqId: generateReqId(),
      reqDate: new Date().toISOString().split('T')[0],
    });
    setChemicalItems(recipe.chemicalItems);
    setAlertDialog({
      isOpen: true,
      title: "Success",
      message: `Recipe "${recipe.name || recipe.formData.project}" loaded successfully!`,
    });
  };

  const handleClear = () => {
    setFormData({
        ...initialFormData,
        reqId: generateReqId()
    });
    setChemicalItems([{ ...initialChemicalItem }]);
  };

  const handleItemsChange = useCallback((newItems: ChemicalItem[]) => {
      setChemicalItems(newItems);
  }, []);

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


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Chemical Requisition (LAB)</h2>
              <p className="text-sm text-gray-500">Create and manage dyeing recipes with precision.</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600">Req ID:</span>
                <span className="ml-2 text-lg font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {formData.reqId}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mb-4">
            <div className="flex space-x-4 p-1 bg-gray-100 rounded-lg">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="sr-only"
                  name="productMode"
                  value="inhouse"
                  checked={formData.productMode === 'inhouse'}
                  onChange={(e) => setFormData({ ...formData, productMode: e.target.value as 'inhouse' | 'subcontract' })}
                />
                <span className={`px-4 py-1 text-sm rounded-md transition ${formData.productMode === 'inhouse' ? 'bg-white shadow-sm text-gray-800 font-semibold' : 'text-gray-600'}`}>
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
                <span className={`px-4 py-1 text-sm rounded-md transition ${formData.productMode === 'subcontract' ? 'bg-white shadow-sm text-gray-800 font-semibold' : 'text-gray-600'}`}>
                  Subcontract
                </span>
              </label>
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
            <Button onClick={() => setIsSaveRecipeOpen(true)} className="bg-[#1A3636] hover:bg-green-900 text-white">Save Recipe</Button>
            <Button onClick={() => setIsViewRecipesOpen(true)} className="bg-[#1A3636] hover:bg-green-900 text-white flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              View Recipes
            </Button>
            <Button onClick={handlePrint} className="bg-[#FF9900] hover:bg-orange-500 text-white flex items-center">
              <Printer className="h-5 w-5 mr-2" />
              View/Print
            </Button>
          </div>
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

      <ViewRecipesDialog
        isOpen={isViewRecipesOpen}
        onClose={() => setIsViewRecipesOpen(false)}
        onRetrieve={handleLoadRecipe}
      />

      {alertDialog && (
        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog(null)}
          title={alertDialog.title}
          message={alertDialog.message}
        />
      )}
    </div>
  );
}
