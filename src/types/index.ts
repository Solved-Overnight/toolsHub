import { ChemicalItem } from './chemical';

export interface DyeingFormData {
  project: string;
  fabricType: string;
  color: string;
  labDipNo: string;
  batchNo: string;
  buyer: string;
  gsm: string;
  machineNo: string;
  reqDate: string;
  dyingType: string;
  colorGroup: string;
  composition: string;
  fabricWeight: number | null;
  liquorRatio: number | null;
  totalWater: number | null;
  workOrder: string;
  chemicalItems: ChemicalItem[];
}

export const DYEING_TYPES = [
  'Fresh Dyeing',
  'Reprocess/Rewash',
  'Enzyme Wash',
  'Normal Wash',
  'Bulk',
  'Sample',
];

export const COLOR_GROUPS = [
  'Reactive',
  'Direct',
  'Disperse',
  'Acid',
  'Pigment',
  'Vat',
  'Sulphur',
  'Basic',
];

export const calculateTotalWater = (fabricWeight: number | null, liquorRatio: number | null): number | null => {
  if (fabricWeight === null || liquorRatio === null) {
    return null;
  }
  return fabricWeight * liquorRatio;
};

export const initialDyeingFormData: DyeingFormData = {
  project: '',
  fabricType: '',
  color: '',
  labDipNo: '',
  batchNo: '',
  buyer: '',
  gsm: '',
  machineNo: '',
  reqDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  dyingType: '',
  colorGroup: '',
  composition: '',
  fabricWeight: null,
  liquorRatio: null,
  totalWater: null,
  workOrder: '',
  chemicalItems: [],
};

export interface Recipe {
  id: string;
  name: string;
  data: DyeingFormData;
  createdAt: string;
}
