import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Calculator, Beaker, Settings2, History, Printer, HandMetal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { DyeingForm } from '../components/DyeingForm';
import { ChemicalItemsTable } from '../components/ChemicalItemsTable';
import { PrintableReport } from '../components/PrintableReport';
import { SettingsDialog } from '../components/SettingsDialog';
import { useReactToPrint } from 'react-to-print';
import type { DyeingFormData, ChemicalItem, Settings, Recipe } from '../types';
import { calculateTotalWater } from '../types';

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

  const handleSave = () => {
    const recipe: Recipe = {
      id: formData.reqId,
      timestamp: new Date().toISOString(),
      formData,
      chemicalItems
    };

    try {
        const existingRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        // Prevent duplicates if saving multiple times quickly
        const filteredRecipes = existingRecipes.filter((r: Recipe) => r.id !== recipe.id);
        const updatedRecipes = [recipe, ...filteredRecipes];
        localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
        alert('Recipe saved successfully!');
    } catch (error) {
        console.error("Failed to save recipe:", error);
        alert('Error saving recipe. Check console for details.');
    }
  };

  const handleClear = () => {
    setFormData({
        ...initialFormData,
        reqId: generateReqId()
    });
    setChemicalItems([{ ...initialChemicalItem }]);
  };

  // Handler for general item changes (add, remove, update fields)
  const handleItemsChange = useCallback((newItems: ChemicalItem[]) => {
      setChemicalItems(newItems);
  }, []);

  // Handler specifically for reordering items
  const handleReorderItems = useCallback((startIndex: number, endIndex: number) => {
    console.log(`Reordering from index ${startIndex} to ${endIndex}`); // Debug log
    setChemicalItems(prevItems => {
      const result = Array.from(prevItems);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      console.log('New items order:', result); // Debug log
      return result;
    });
  }, []);

  // Drag and Drop Handler
  const handleOnDragEnd = (result: DropResult) => {
    console.log('onDragEnd triggered:', result); // Debug log

    // Check if dropped outside the list
    if (!result.destination) {
      console.log('Dropped outside a droppable area'); // Debug log
      return;
    }

    // Check if dropped in the same place
    if (result.source.index === result.destination.index) {
      console.log('Dropped in the same position'); // Debug log
      return;
    }

    // Perform the reorder
    handleReorderItems(result.source.index, result.destination.index);
  };


  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold">Chemical Requisition (LAB)</h2>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <span className="text-sm font-medium">Req ID:</span>
                <span className={`ml-2 text-lg font-medium ${settings.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formData.reqId}
                </span>
              </div>
              <div className="flex space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600"
                    name="productMode"
                    value="inhouse"
                    checked={formData.productMode === 'inhouse'}
                    onChange={(e) => setFormData({ ...formData, productMode: e.target.value as 'inhouse' | 'subcontract' })}
                  />
                  <span className="ml-2 flex items-center text-sm">
                    Inhouse
                  </span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600"
                    name="productMode"
                    value="subcontract"
                    checked={formData.productMode === 'subcontract'}
                    onChange={(e) => setFormData({ ...formData, productMode: e.target.value as 'inhouse' | 'subcontract' })}
                  />
                  <span className="ml-2 flex items-center text-sm">
                    Subcontract
                  </span>
                </label>
              </div>
            </div>
          </div>

          <DyeingForm data={formData} onChange={setFormData} />

          {/* Wrap ChemicalItemsTable with DragDropContext */}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <ChemicalItemsTable
              items={chemicalItems}
              totalWater={formData.totalWater}
              fabricWeight={formData.fabricWeight}
              onItemsChange={handleItemsChange}
            />
          </DragDropContext>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button variant="outline" onClick={handleClear}>Clear Form</Button>
            <Button onClick={handleSave}>Save Recipe</Button>
            <Button onClick={handlePrint} className="flex items-center">
              <Printer className="h-5 w-5 mr-2" />
              View/Print
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden Printable Report */}
      <div style={{ display: 'none' }}>
        <PrintableReport ref={printRef} data={formData} chemicalItems={chemicalItems} />
      </div>

      {/* Settings Dialog - Assuming this component exists and works */}
      {/* <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      /> */}
    </div>
  );
}
