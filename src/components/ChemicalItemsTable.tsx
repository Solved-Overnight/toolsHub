import React, { useEffect } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ChemicalItem, ITEM_TYPES, convertToSubUnits, calculateQtyFromDosing, calculateQtyFromShade } from '../types';
import { Button } from './ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ChemicalItemsTableProps {
  items: ChemicalItem[];
  totalWater: number | null;
  fabricWeight: number | null;
  onItemsChange: (items: ChemicalItem[]) => void;
}

export const ChemicalItemsTable: React.FC<ChemicalItemsTableProps> = ({
  items,
  totalWater,
  fabricWeight,
  onItemsChange,
}) => {
  const addNewItem = () => {
    onItemsChange([
      ...items,
      {
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
      },
    ]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ChemicalItem, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index] };

    // Handle Dyeing step special case
    if (field === 'itemType' && value === 'Dyeing step') {
      currentItem.itemType = value;
      currentItem.itemName = '-------';
      currentItem.lotNo = '-------';
      currentItem.dosing = null;
      currentItem.shade = null;
      currentItem.qty = { kg: null, gm: null, mg: null };
      currentItem.unitPrice = null;
      currentItem.costing = 0;
      currentItem.remarks = '-------';
    } else if (field === 'itemType' && currentItem.itemType === 'Dyeing step' && value !== 'Dyeing step') {
      // Reset values when changing from Dyeing step to another type
      currentItem.itemType = value;
      currentItem.itemName = '';
      currentItem.lotNo = '';
      currentItem.dosing = null;
      currentItem.shade = null;
      currentItem.qty = { kg: null, gm: null, mg: null };
      currentItem.unitPrice = null;
      currentItem.costing = 0;
      currentItem.remarks = '';
    } else if (field === 'highlight') {
      currentItem.highlight = value as boolean;
    } else if (field === 'dosing') {
      const dosing = value === '' ? null : !isNaN(Number(value)) ? Number(value) : currentItem.dosing;
      currentItem.dosing = dosing;
      currentItem.shade = null; // Clear shade if dosing is entered
      const calculatedQtyKg = calculateQtyFromDosing(dosing, totalWater);
      currentItem.qty = convertToSubUnits(calculatedQtyKg);
    } else if (field === 'shade') {
      const shade = value === '' ? null : !isNaN(Number(value)) ? Number(value) : currentItem.shade;
      currentItem.shade = shade;
      currentItem.dosing = null; // Clear dosing if shade is entered
      const calculatedQtyKg = calculateQtyFromShade(shade, fabricWeight);
      currentItem.qty = convertToSubUnits(calculatedQtyKg);
    } else if (field === 'unitPrice') {
      const unitPrice = value !== '' && !isNaN(Number(value)) ? Number(value) : null;
      currentItem.unitPrice = unitPrice;
    } else {
      // Ensure boolean values are handled correctly if other boolean fields exist
      if (typeof currentItem[field] === 'boolean' && field !== 'highlight') {
        currentItem[field] = Boolean(value);
      } else if (field !== 'highlight') {
        currentItem[field] = value;
      }
    }

    // Recalculate costing whenever relevant fields change
    const totalQtyKg = (currentItem.qty.kg || 0) + (currentItem.qty.gm || 0) / 1000 + (currentItem.qty.mg || 0) / 1000000;
    currentItem.costing = totalQtyKg * (currentItem.unitPrice || 0);


    newItems[index] = currentItem;
    onItemsChange(newItems);
  };


  useEffect(() => {
    let changed = false;
    const updatedItems = items.map(item => {
      let newItem = { ...item };
      let calculatedQtyKg: number | null = null;

      if (item.dosing !== null && totalWater !== null) {
        calculatedQtyKg = calculateQtyFromDosing(item.dosing, totalWater);
      } else if (item.shade !== null && fabricWeight !== null) {
        calculatedQtyKg = calculateQtyFromShade(item.shade, fabricWeight);
      } else {
         calculatedQtyKg = null;
      }

      const newQty = convertToSubUnits(calculatedQtyKg);

      if (JSON.stringify(newItem.qty) !== JSON.stringify(newQty)) {
          newItem.qty = newQty;
          changed = true;
      }

      const totalQtyKgForCosting = (newItem.qty.kg || 0) + (newItem.qty.gm || 0) / 1000 + (newItem.qty.mg || 0) / 1000000;
      const newCosting = totalQtyKgForCosting * (newItem.unitPrice || 0);

      if (newItem.costing !== newCosting) {
          newItem.costing = newCosting;
          changed = true;
      }

      return newItem;
    });

    if (changed) {
        if (JSON.stringify(items) !== JSON.stringify(updatedItems)) {
            onItemsChange(updatedItems);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalWater, fabricWeight, items]);


  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-900">Chemical Items</h3>
        <Button
          onClick={addNewItem}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-200 table-fixed"> {/* Added table-fixed */}
          <colgroup>
            <col style={{ width: '12%' }} /> {/* Item Type */}
            <col style={{ width: '25%' }} /> {/* Item Name - Further increased width */}
            <col style={{ width: '10%' }} /> {/* Lot No */}
            <col style={{ width: '8%' }} />  {/* Dosing */}
            <col style={{ width: '8%' }} />  {/* Shade */}
            <col style={{ width: '5%' }} />  {/* Qty kg - Reduced width */}
            <col style={{ width: '5%' }} />  {/* Qty gm - Reduced width */}
            <col style={{ width: '5%' }} />  {/* Qty mg - Reduced width */}
            <col style={{ width: '8%' }} />  {/* Unit Price */}
            <col style={{ width: '8%' }} />  {/* Costing */}
            <col style={{ width: '8%' }} />  {/* Remarks - Reduced width */}
            <col style={{ width: '8%' }} />  {/* Actions - Reduced width */}
          </colgroup>
          <thead className="bg-slate-50">
            <tr>
              <th className="border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Item Type</th>
              {/* Increased width implicitly via colgroup */}
              <th className="border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
              <th className="border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Lot No</th>
              {/* Reduced padding */}
              <th className="border border-slate-200 px-1 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Dosing (g/l)</th>
              {/* Reduced padding */}
              <th className="border border-slate-200 px-1 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Shade (%)</th>
              <th colSpan={3} className="border border-slate-200 px-1 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Quantity
                <div className="grid grid-cols-3 gap-0 mt-0.5 text-[10px]">
                  <div className="border border-slate-200 py-0.5">KG</div>
                  <div className="border border-slate-200 py-0.5">GM</div>
                  <div className="border border-slate-200 py-0.5">MG</div>
                </div>
              </th>
              {/* Reduced padding */}
              <th className="border border-slate-200 px-1 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
              {/* Reduced padding */}
              <th className="border border-slate-200 px-1 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Costing</th>
              <th className="border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Remarks</th>
              <th className="border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <Droppable droppableId="chemicalItems">
            {(providedDroppable) => (
              <tbody
                className="bg-white"
                ref={providedDroppable.innerRef}
                {...providedDroppable.droppableProps}
              >
                {items.map((item, index) => (
                  <Draggable key={`item-${index}`} draggableId={`item-${index}`} index={index}>
                    {(providedDraggable, snapshot) => (
                      <tr
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        style={{
                          ...providedDraggable.draggableProps.style,
                          backgroundColor: snapshot.isDragging ? 'rgba(230, 247, 255, 0.7)' : (item.highlight ? '#FFFBEB' : 'white'),
                          boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                        }}
                        className={`${item.highlight ? 'bg-yellow-100' : ''} ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <td className="border border-slate-200 px-2 py-1.5 whitespace-nowrap text-center">
                          <select
                            value={item.itemType}
                            onChange={(e) => updateItem(index, 'itemType', e.target.value)}
                            className="w-full border-0 bg-transparent focus:ring-0 p-0 text-center text-sm"
                          >
                            <option value="">Select Type</option>
                            {ITEM_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </td>
                        {/* Increased width implicitly via colgroup */}
                        <td className="border border-slate-200 px-2 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                            className="w-full border-0 bg-transparent focus:ring-0 p-0 text-center text-sm"
                            placeholder="Name"
                          />
                        </td>
                        <td className="border border-slate-200 px-2 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="text"
                            value={item.lotNo}
                            onChange={(e) => updateItem(index, 'lotNo', e.target.value)}
                            className="w-full border-0 bg-transparent focus:ring-0 p-0 text-center text-sm"
                            placeholder="Lot #"
                          />
                        </td>
                        {/* Reduced padding */}
                        <td className="border border-slate-200 px-1 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="number"
                            value={item.dosing ?? ''}
                            onChange={(e) => updateItem(index, 'dosing', e.target.value)}
                            className="w-full border-0 bg-transparent focus:ring-0 p-0 text-center text-sm"
                            placeholder="g/l"
                            min="0"
                            step="any"
                            disabled={item.shade !== null && item.shade !== undefined && String(item.shade).trim() !== ''}
                          />
                        </td>
                        {/* Reduced padding */}
                        <td className="border border-slate-200 px-1 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="number"
                            value={item.shade ?? ''}
                            onChange={(e) => updateItem(index, 'shade', e.target.value)}
                            className="w-full border-0 bg-transparent focus:ring-0 p-0 text-center text-sm"
                            placeholder="%"
                            min="0"
                            step="any"
                            disabled={item.dosing !== null && item.dosing !== undefined && String(item.dosing).trim() !== ''}
                          />
                        </td>
                        <td className="border border-slate-200 px-0.5 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="text"
                            value={item.qty.kg !== null ? item.qty.kg.toFixed(0) : ''}
                            readOnly
                            className="w-full border-0 bg-transparent focus:ring-0 text-slate-500 text-center p-0 text-sm"
                          />
                        </td>
                        <td className="border border-slate-200 px-0.5 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="text"
                            value={item.qty.gm !== null ? item.qty.gm.toFixed(0) : ''}
                            readOnly
                            className="w-full border-0 bg-transparent focus:ring-0 text-slate-500 text-center p-0 text-sm"
                          />
                        </td>
                        <td className="border border-slate-200 px-0.5 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="text"
                            value={item.qty.mg !== null ? item.qty.mg.toFixed(0) : ''}
                            readOnly
                            className="w-full border-0 bg-transparent focus:ring-0 text-slate-500 text-center p-0 text-sm"
                          />
                        </td>
                        {/* Reduced padding */}
                        <td className="border border-slate-200 px-1 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="number"
                            value={item.unitPrice ?? ''}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                            className="w-full border-0 bg-transparent focus:ring-0 p-0 text-center text-sm"
                            placeholder="Price"
                            min="0"
                            step="any"
                          />
                        </td>
                        {/* Reduced padding */}
                        <td className="border border-slate-200 px-1 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="text"
                            value={item.costing.toFixed(2)}
                            readOnly
                            className="w-full border-0 bg-transparent focus:ring-0 text-slate-500 text-center p-0 text-sm"
                          />
                        </td>
                        <td className="border border-slate-200 px-2 py-1.5 whitespace-nowrap text-center">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                            className="w-full border-0 bg-transparent focus:ring-0 p-0 text-center text-sm"
                            placeholder="Remarks"
                          />
                        </td>
                        <td className="border border-slate-200 px-2 py-1.5 whitespace-nowrap text-center align-middle">
                          <div className="flex items-center justify-center space-x-1"> {/* Reduced space */}
                            <div
                              {...providedDraggable.dragHandleProps}
                              className="cursor-grab text-slate-400 hover:text-slate-600 p-0.5" /* Adjusted padding */
                              title="Drag to reorder"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <input
                              type="checkbox"
                              checked={item.highlight}
                              onChange={(e) => updateItem(index, 'highlight', e.target.checked)}
                              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                              title="Highlight row"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 p-0.5" /* Adjusted padding */
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {providedDroppable.placeholder}
              </tbody>
            )}
          </Droppable>
          {/* Updated Footer */}
          <tfoot className="bg-slate-50">
            <tr>
              {/* Span columns before Unit Price (Item Type, Item Name, Lot No, Dosing, Shade, Qty KG, Qty GM, Qty MG) = 8 columns */}
              <td colSpan={8} className="border border-slate-200 px-1 py-3"></td>
              {/* Label under Unit Price - Changed text-right to text-center */}
              <td className="border border-slate-200 px-1 py-3 text-center font-medium">
                Total:
              </td>
              {/* Sum under Costing */}
              <td className="border border-slate-200 px-1 py-3 font-medium text-center">
                {items.reduce((sum, item) => sum + item.costing, 0).toFixed(2)}
              </td>
              {/* Span remaining columns (Remarks, Actions) = 2 columns */}
              <td colSpan={2} className="border border-slate-200"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
