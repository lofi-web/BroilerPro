
export interface MedicationRecipe {
  id: string;
  name: string;
  dosagePerLiter: number;
  unit: 'ml' | 'g';
  waterLiters?: number;
}

export interface MedicationUsage {
  id: string;
  name: string;
  dosagePerLiter: number;
  unit: 'ml' | 'g';
  waterLiters: number;
  totalNeeded: number;
  date: string;
  notes?: string;
}

export interface DailyRecord {
  id: string;
  date: string;
  mortality: number;
  feedConsumedKg: number;
  feedBagsConsumed: number;
  feedBagsReceived?: number; 
  feedPricePerBag?: number;
  medicineCost: number;
  weightAverage?: number; 
  vaccineGiven?: string;
  notes?: string;
}

export interface FinancialEntry {
  id: string;
  date: string;
  type: 'expense' | 'income';
  category: string;
  amount: number;
  description: string;
}

export interface SaleEntry {
  id: string;
  date: string;
  birdCount: number;
  totalWeight: number;
  totalPrice: number;
  paidAmount: number;
  status: 'paid' | 'unpaid' | 'partial';
  customerName?: string;
  averageWeight: number;
}

export interface VaccineStatus {
  day: number;
  name: string;
  isDone: boolean;
}

export interface Batch {
  id: string;
  name: string;
  startDate: string;
  initialCount: number;
  chickCost: number;
  status: 'active' | 'closed';
  dailyRecords: DailyRecord[];
  financials: FinancialEntry[];
  sales: SaleEntry[];
  vaccineSchedule: VaccineStatus[];
  medicationHistory: MedicationUsage[];
  closedDate?: string;
  totalSaleWeight?: number;
  totalSalePrice?: number;
}

export type ViewState = 'dashboard' | 'batches' | 'financials' | 'sales' | 'ai-advisor';
