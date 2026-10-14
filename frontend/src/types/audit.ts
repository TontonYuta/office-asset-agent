export type AIMRMStatus = 
  | 'RECOMMENDED_APPROVAL'      // ĐỀ XUẤT DUYỆT (Green)
  | 'EXCEEDED_NORM_WARNING'     // CẢNH BÁO VƯỢT ĐỊNH MỨC (Yellow)
  | 'REJECTED_OUT_OF_STOCK';    // TỪ CHỐI DO ÂM KHO (Red)

export interface AllocationRequest {
  id: string;
  department: string;
  assetId: string;
  assetName: string;
  requestedQuantity: number;
  unit: string;
  purpose: string;
  requesterName: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  auditReason?: string;
}

export interface AIMRMResult {
  safeStock: number;           // S_safe
  zScore: number;              // Z-Score
  projectedStock: number;      // S_curr - Q_req
  isAnomaly: boolean;          // Z > 2.0
  isNegativeStock: boolean;    // Q_req > S_curr
  isBelowSafeStock: boolean;   // projectedStock < safeStock
  status: AIMRMStatus;
  statusLabel: string;
  confidenceScore: number;     // 0.95
  formulaBreakdown: {
    zAlpha: number;            // 1.645
    sigmaD: number;            // Standard deviation of demand
    leadTime: number;          // Lead time L (weeks)
    meanDemand: number;        // μ
    currentStock: number;      // S_curr
    requestedQuantity: number; // Q_req
  };
}

export interface HistoricalEpisode {
  id: string;
  department: string;
  assetId: string;
  assetName: string;
  pastQuantity: number;
  date: string;
  outcome: 'FULFILLED' | 'ADJUSTED' | 'REJECTED';
  note: string;
  similarityScore?: number;
}
