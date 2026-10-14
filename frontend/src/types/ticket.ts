export type TicketStatus = 
  | 'PENDING_APPROVAL' // Chờ duyệt
  | 'APPROVED'         // Đã duyệt
  | 'IN_PROGRESS'      // Đang xử lý
  | 'RESOLVED'         // Đã hoàn thành
  | 'REJECTED';        // Từ chối

export type TicketUrgency = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export const URGENCY_LABELS: Record<TicketUrgency, string> = {
  LOW: 'Thấp',
  NORMAL: 'Bình thường',
  HIGH: 'Ưu tiên cao',
  CRITICAL: 'Khẩn cấp',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã duyệt sửa chữa',
  IN_PROGRESS: 'Đang khắc phục',
  RESOLVED: 'Đã hoàn tất',
  REJECTED: 'Không duyệt',
};

export interface MaintenanceTicket {
  id: string; // e.g. "PBH-2026-042"
  officialDocNumber: string; // e.g. "42/TTr-HCQT"
  assetId: string;
  assetName: string;
  assetModel: string;
  department: string;
  reporterName: string;
  reporterRole: string;
  location: string;
  createdAt: string;
  symptomDescription: string;
  preliminaryDiagnosis: string;
  proposedAction: string;
  estimatedCost: number; // VNĐ
  urgency: TicketUrgency;
  status: TicketStatus;
  conversationSummary?: string;
  approvedBy?: string;
  approvalDate?: string;
  assignedTechnician?: string;
}
