import React from 'react';
import { DyeingFormData, DYEING_TYPES, COLOR_GROUPS, calculateTotalWater } from '../types';

interface DyeingFormProps {
  data: DyeingFormData;
  onChange: (data: DyeingFormData) => void;
}

export function DyeingForm({ data, onChange }: DyeingFormProps) {
  const handleChange = (field: keyof DyeingFormData, value: string | number | null) => {
    const newData = {
      ...data,
      [field]: value,
    };

    // Update total water when fabric weight or liquor ratio changes
    if (field === 'fabricWeight' || field === 'liquorRatio') {
      const fabricWeight = field === 'fabricWeight' ? (value as number) : data.fabricWeight;
      const liquorRatio = field === 'liquorRatio' ? (value as number) : data.liquorRatio;

      // Ensure non-negative values
      newData.fabricWeight = fabricWeight === null ? null : Math.max(0, fabricWeight);
      newData.liquorRatio = liquorRatio === null ? null : Math.max(0, liquorRatio);
      newData.totalWater = calculateTotalWater(newData.fabricWeight, newData.liquorRatio);
    }

    onChange(newData);
  };

  // Common input classes
  const inputClasses = "mt-1 block w-full rounded-md border-border shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground py-1 px-3";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Column 1 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">Project</label>
          <input
            type="text"
            value={data.project}
            onChange={(e) => handleChange('project', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Fabric Type</label>
          <input
            type="text"
            value={data.fabricType}
            onChange={(e) => handleChange('fabricType', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Color</label>
          <input
            type="text"
            value={data.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Lab Dip No.</label>
          <input
            type="text"
            value={data.labDipNo}
            onChange={(e) => handleChange('labDipNo', e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">Batch No.</label>
          <input
            type="text"
            value={data.batchNo}
            onChange={(e) => handleChange('batchNo', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Buyer</label>
          <input
            type="text"
            value={data.buyer}
            onChange={(e) => handleChange('buyer', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">F/GSM</label>
          <input
            type="text"
            value={data.gsm}
            onChange={(e) => handleChange('gsm', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Machine No.</label>
          <input
            type="text"
            value={data.machineNo}
            onChange={(e) => handleChange('machineNo', e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Column 3 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">Date</label>
          <input
            type="date"
            value={data.reqDate}
            onChange={(e) => handleChange('reqDate', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Dying Type</label>
          <select
            value={data.dyingType}
            onChange={(e) => handleChange('dyingType', e.target.value)}
            className={inputClasses}
          >
            <option value="">Select Type</option>
            {DYEING_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Color Group</label>
          <select
            value={data.colorGroup}
            onChange={(e) => handleChange('colorGroup', e.target.value)}
            className={inputClasses}
          >
            <option value="">Select Group</option>
            {COLOR_GROUPS.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Composition</label>
          <input
            type="text"
            value={data.composition}
            onChange={(e) => handleChange('composition', e.target.value)}
            className={inputClasses}
            placeholder="e.g., 95% Cotton, 5% Elastane"
          />
        </div>
      </div>

      {/* Column 4 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">Fabric Weight (kg)</label>
          <input
            type="number"
            value={data.fabricWeight ?? ''}
            onChange={(e) => handleChange('fabricWeight', e.target.value ? Number(e.target.value) : null)}
            min="0"
            step="0.01"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Liquor Ratio</label>
          <input
            type="number"
            value={data.liquorRatio ?? ''}
            onChange={(e) => handleChange('liquorRatio', e.target.value ? Number(e.target.value) : null)}
            min="0"
            step="0.1"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Total Water</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="number"
              value={data.totalWater ?? ''}
              readOnly
              className="block w-full rounded-l-md border-border bg-muted text-muted-foreground py-1 px-3"
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-border bg-muted text-muted-foreground sm:text-sm">
              L
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Work Order</label>
          <input
            type="text"
            value={data.workOrder}
            onChange={(e) => handleChange('workOrder', e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
}
