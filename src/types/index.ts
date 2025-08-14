export interface DyeingFormData {
  reqId: string;
  reqDate: string;
  project: string;
  fabricType: string;
  color: string;
  colorMore: string;
  labDipNo: string;
  machineDesc: string;
  machineNo: string;
  remarks: string;
  reelSpeed: string;
  pumpSpeed: string;
  cycleTime: string;
  dyingType: string;
  colorGroup: string;
  lotNo: string;
  gsm: string;
  productMode: 'inhouse' | 'subcontract';
  workOrder: string;
  fabricQty: string;
  buyer: string;
  batchNo: string;
  batchQty: string;
  orderNo: string;
  fabricWeight: number | null;
  liquorRatio: number | null;
  totalWater: number | null;
  composition: string;
}

export interface ChemicalItem {
  itemType: 'Chemical' | 'Dyes' | 'Dyeing step' | '';
  itemName: string;
  lotNo: string;
  dosing: number | null;
  shade: number | null;
  qty: {
    kg: number | null;
    gm: number | null;
    mg: number | null;
  };
  unitPrice: number | null;
  costing: number;
  remarks: string;
  highlight: boolean; // Added highlight field
}

export interface Settings {
  industryName: string;
  theme: 'light' | 'dark' | 'dracula' | 'github' | 'monokai';
  currency: string;
  dateFormat: string;
}

export interface Recipe {
  id: string;
  timestamp: string;
  formData: DyeingFormData;
  chemicalItems: ChemicalItem[];
}

export const DYEING_TYPES = ['Regular', 'Sample', 'Bulk'] as const;
export const COLOR_GROUPS = ['Light', 'Medium', 'Dark'] as const;
export const ITEM_TYPES = ['Chemical', 'Dyes', 'Dyeing step'] as const;

export const calculateTotalWater = (fabricWeight: number | null, liquorRatio: number | null): number | null => {
  if (fabricWeight === null || liquorRatio === null || isNaN(fabricWeight) || isNaN(liquorRatio)) {
    return null;
  }
  const result = Math.max(0, fabricWeight) * Math.max(0, liquorRatio);
  return isNaN(result) ? null : result;
};

export const calculateQtyFromDosing = (dosing: number | null, totalWater: number | null): number | null => {
  if (dosing === null || totalWater === null || isNaN(dosing) || isNaN(totalWater)) {
    return null;
  }
  // Calculate quantity in KG
  const result = (totalWater * dosing) / 1000;
  return isNaN(result) ? null : result;
};

export const calculateQtyFromShade = (shade: number | null, fabricWeight: number | null): number | null => {
  if (shade === null || fabricWeight === null || isNaN(shade) || isNaN(fabricWeight)) {
    return null;
  }
  // Calculate quantity in KG
  const result = (shade * fabricWeight) / 100;
  return isNaN(result) ? null : result;
};

// Converts total KG into KG, GM, MG parts
export const convertToSubUnits = (totalKg: number | null): { kg: number | null; gm: number | null; mg: number | null; } => {
  if (totalKg === null || isNaN(totalKg) || totalKg < 0) {
    return { kg: null, gm: null, mg: null };
  }

  const kg = Math.floor(totalKg);
  const remainingGrams = (totalKg - kg) * 1000;
  const gm = Math.floor(remainingGrams);
  const mg = Math.round((remainingGrams - gm) * 1000); // Round mg for precision

  // Handle potential rounding issues where mg becomes 1000
  if (mg === 1000) {
    return { kg: kg, gm: gm + 1, mg: 0 };
  }
  // Handle potential cascading rounding issues where gm becomes 1000
  if (gm === 1000) {
     return { kg: kg + 1, gm: 0, mg: mg };
  }


  return {
    kg: kg,
    gm: gm,
    mg: mg
  };
};
