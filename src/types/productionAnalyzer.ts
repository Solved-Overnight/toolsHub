
export interface ColorGroupData {
  groupName: string;
  weight: number;
  percentage?: number;
}

export interface IndustryData {
  name: string;
  total: number;
  loadingCap?: number;
  colorGroups: ColorGroupData[];
  inhouse: number;
  subContract: number;
}

export interface ProductionRecord {
  id: string;
  date: string; // ISO format or DD MMM YYYY
  lantabur: IndustryData;
  taqwa: IndustryData;
  totalProduction: number;
  createdAt: string;
}

export interface DashboardStats {
  todayTotal: number;
  monthTotal: number;
  yearTotal: number;
  industryComparison: {
    lantabur: number;
    taqwa: number;
  };
}
