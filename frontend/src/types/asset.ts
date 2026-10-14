export type AssetCategory = 
  | 'Vật tư tiêu hao'
  | 'Thiết bị dùng chung'
  | 'Thiết bị văn phòng';

export type StockStatus = 
  | 'AVAILABLE'     // Sẵn sàng
  | 'LOW_STOCK'     // Sắp hết
  | 'MAINTENANCE'   // Đang bảo dưỡng
  | 'OUT_OF_STOCK'; // Hết hàng

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  AVAILABLE: 'Sẵn sàng',
  LOW_STOCK: 'Sắp hết kho',
  MAINTENANCE: 'Đang bảo dưỡng',
  OUT_OF_STOCK: 'Hết hàng',
};

export interface Asset {
  id: string; // e.g. "VT-101", "TB-204"
  name: string;
  model: string;
  category: AssetCategory;
  location: string;
  currentStock: number;
  minSafeStock: number;
  maxCapacity: number;
  unit: string;
  unitPrice: number; // in VNĐ
  status: StockStatus;
  lastAudited: string;
  meanMonthlyDemand: number; // μ
  stdDevDemand: number;      // σ
  leadTimeWeeks: number;     // L
  serialNumber?: string;
  specifications?: Record<string, string>;
}

export interface StockAdjustmentTransaction {
  id: string;
  assetId: string;
  assetName: string;
  type: 'IN' | 'OUT'; // Nhập / Xuất
  typeLabel?: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  timestamp: string;
  performedBy: string;
  reason: string;
  referenceDoc?: string;
}
