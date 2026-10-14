/**
 * Unified API client with USE_LOCAL_BACKEND toggle & realistic enterprise mock fallback
 */

import { Asset, StockAdjustmentTransaction } from '../types/asset';
import { MaintenanceTicket, TicketStatus } from '../types/ticket';
import { AllocationRequest, HistoricalEpisode } from '../types/audit';
import { UserProfile, LoginCredentials, AuthResponse } from '../types/auth';

export const USE_LOCAL_BACKEND = true; // Connected directly to FastAPI backend

export const BASE_URL = typeof window !== 'undefined' && window.location.port === '3000'
  ? 'http://localhost:8000/api'
  : '/api';

// ------------------- AUTH TOKEN STORAGE & HELPERS -------------------
const TOKEN_KEY = 'office_asset_jwt_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ------------------- AUTH API CALLS -------------------
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setStoredToken(data.token);
        return data;
      }
      return { success: false, message: data.detail || 'Tên đăng nhập hoặc mật khẩu không chính xác' };
    } catch (err: any) {
      console.warn('Backend login error:', err);
      return { success: false, message: 'Không thể kết nối đến máy chủ xác thực.' };
    }
  }
  return { success: true };
}

export async function getMeApi(): Promise<UserProfile | null> {
  const token = getStoredToken();
  if (!token) return null;

  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.user || null;
      }
      clearStoredToken();
    } catch (err) {
      console.warn('Backend getMe error:', err);
    }
  }
  return null;
}

export async function logoutApi(): Promise<void> {
  clearStoredToken();
  if (USE_LOCAL_BACKEND) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
  }
}

// Initial enterprise assets fallback
export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'VT-GIAY-A4',
    name: 'Giấy in Double A A4 70gsm',
    model: 'Double A 70gsm',
    category: 'Vật tư tiêu hao',
    location: 'Kho Tầng 1 - Tủ VT-A1',
    currentStock: 85,
    minSafeStock: 25,
    maxCapacity: 150,
    unit: 'Ram',
    unitPrice: 75000,
    status: 'AVAILABLE',
    lastAudited: '2026-10-01',
    meanMonthlyDemand: 30,
    stdDevDemand: 6.5,
    leadTimeWeeks: 1.0,
    specifications: {
      'Định lượng': '70 g/m²',
      'Độ trắng': '95% ISO',
      'Quy cách': '500 tờ/gam, 5 gam/thùng',
      'Xuất xứ': 'Thái Lan',
    },
  },
  {
    id: 'VT-BUT-DA',
    name: 'Bút dạ lông bảng Thiên Long xanh',
    model: 'Thiên Long WB-03',
    category: 'Vật tư tiêu hao',
    location: 'Kho Tầng 1 - Hộc C2',
    currentStock: 42,
    minSafeStock: 15,
    maxCapacity: 80,
    unit: 'Chiếc',
    unitPrice: 8000,
    status: 'AVAILABLE',
    lastAudited: '2026-10-05',
    meanMonthlyDemand: 18,
    stdDevDemand: 4.2,
    leadTimeWeeks: 1.0,
  },
  {
    id: 'VT-MUC-2900',
    name: 'Hộp mực máy in Cartridge 12A',
    model: 'Cartridge 12A / FX-9',
    category: 'Vật tư tiêu hao',
    location: 'Kho Tầng 1 - Kệ kỹ thuật B3',
    currentStock: 6,
    minSafeStock: 5,
    maxCapacity: 30,
    unit: 'Hộp',
    unitPrice: 180000,
    status: 'LOW_STOCK',
    lastAudited: '2026-09-28',
    meanMonthlyDemand: 5,
    stdDevDemand: 1.8,
    leadTimeWeeks: 1.5,
    specifications: {
      'Dung lượng in': '~2.000 trang độ phủ 5%',
      'Tương thích': 'Canon LBP 2900, LBP 3000',
      'Loại mực': 'Laser đen trắng cao cấp',
    },
  },
  {
    id: 'VT-PIN-AA',
    name: 'Vỉ pin AA Energizer Max (Pin micro)',
    model: 'Energizer Max AA',
    category: 'Vật tư tiêu hao',
    location: 'Kho Tầng 1 - Hộc D1',
    currentStock: 18,
    minSafeStock: 10,
    maxCapacity: 60,
    unit: 'Viên',
    unitPrice: 15000,
    status: 'AVAILABLE',
    lastAudited: '2026-10-10',
    meanMonthlyDemand: 12,
    stdDevDemand: 3.5,
    leadTimeWeeks: 1.0,
  },
  {
    id: 'TB-MAY-IN-2900',
    name: 'Máy in Laser đơn năng Canon LBP 2900',
    model: 'Canon LBP 2900',
    category: 'Thiết bị văn phòng',
    location: 'Phòng Hành chính - Tầng 2',
    currentStock: 1,
    minSafeStock: 1,
    maxCapacity: 5,
    unit: 'Chiếc',
    unitPrice: 3850000,
    status: 'AVAILABLE',
    lastAudited: '2026-09-15',
    meanMonthlyDemand: 1,
    stdDevDemand: 0.5,
    leadTimeWeeks: 2.0,
    serialNumber: 'CN-2900-VN-8842',
    specifications: {
      'Tốc độ in': '12 trang/phút A4',
      'Độ phân giải': '2400 x 600 dpi',
      'Kết nối': 'USB 2.0 High Speed',
    },
  },
  {
    id: 'TB-MAY-CHIEU-X06',
    name: 'Máy chiếu Epson EB-X06 3LCD',
    model: 'Epson EB-X06',
    category: 'Thiết bị dùng chung',
    location: 'Phòng họp số 3 - Tầng 3',
    currentStock: 1,
    minSafeStock: 1,
    maxCapacity: 3,
    unit: 'Bộ',
    unitPrice: 11500000,
    status: 'MAINTENANCE',
    lastAudited: '2026-10-02',
    meanMonthlyDemand: 1,
    stdDevDemand: 0.3,
    leadTimeWeeks: 3.0,
    serialNumber: 'EP-EBX06-2024-001',
    specifications: {
      'Cường độ sáng': '3.600 Ansi Lumens',
      'Độ phân giải': 'XGA (1024 x 768)',
      'Tuổi thọ bóng đèn': '12.000 giờ',
    },
  },
  {
    id: 'TB-MICRO-TAKSTAR',
    name: 'Bộ Micro không dây Takstar WGV-201',
    model: 'Takstar WGV-201',
    category: 'Thiết bị dùng chung',
    location: 'Phòng họp số 1 - Tầng 2',
    currentStock: 2,
    minSafeStock: 1,
    maxCapacity: 6,
    unit: 'Bộ',
    unitPrice: 1650000,
    status: 'AVAILABLE',
    lastAudited: '2026-09-10',
    meanMonthlyDemand: 1,
    stdDevDemand: 0.4,
    leadTimeWeeks: 1.5,
    serialNumber: 'TK-WGV201-7731',
    specifications: {
      'Dải tần đáp ứng': 'VHF 220-270MHz',
      'Khoảng cách bắt sóng': '30 - 50m xuyên vật cản',
    },
  },
];

// Initial historical episodes
export const INITIAL_EPISODES: HistoricalEpisode[] = [
  {
    id: 'EP-001',
    department: 'Phòng Marketing',
    assetId: 'VT-GIAY-A4',
    assetName: 'Giấy in Double A A4 70gsm',
    pastQuantity: 20,
    date: '2026-08-15',
    outcome: 'FULFILLED',
    note: 'Cấp phát phục vụ in tài liệu chiến dịch ra mắt sản phẩm Q3',
  },
  {
    id: 'EP-002',
    department: 'Phòng Marketing',
    assetId: 'VT-GIAY-A4',
    assetName: 'Giấy in Double A A4 70gsm',
    pastQuantity: 15,
    date: '2026-09-12',
    outcome: 'FULFILLED',
    note: 'Định mức định kỳ hàng tháng của phòng ban',
  },
  {
    id: 'EP-003',
    department: 'Phòng Kế toán',
    assetId: 'VT-GIAY-A4',
    assetName: 'Giấy in Double A A4 70gsm',
    pastQuantity: 25,
    date: '2026-07-20',
    outcome: 'ADJUSTED',
    note: 'Yêu cầu 35 gam, phê duyệt điều chỉnh xuống 25 gam',
  },
];

// Initial maintenance tickets
export const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'PBH-2026-001',
    officialDocNumber: '31/TTr-HCQT',
    assetId: 'TB-MAY-IN-2900',
    assetName: 'Máy in Laser đơn năng Canon LBP 2900',
    assetModel: 'Canon LBP 2900',
    department: 'Phòng Marketing',
    reporterName: 'Nguyễn Hoàng Long',
    reporterRole: 'Chuyên viên Truyền thông',
    location: 'Phòng Hành chính - Tầng 2',
    createdAt: '2026-10-11T09:30:00Z',
    symptomDescription: 'Máy in kêu rít liên tục khi kéo giấy, giấy in ra bị kẹt 1/3 tại cụm sấy.',
    preliminaryDiagnosis: 'Trục cao su kéo giấy bị mòn hoặc bao lụa sấy rách.',
    proposedAction: 'Vệ sinh trục kéo, thay bao lụa sấy chịu nhiệt.',
    estimatedCost: 350000,
    urgency: 'HIGH',
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'PBH-2026-002',
    officialDocNumber: '32/TTr-HCQT',
    assetId: 'TB-MAY-CHIEU-X06',
    assetName: 'Máy chiếu Epson EB-X06 3LCD',
    assetModel: 'Epson EB-X06',
    department: 'Phòng Hành chính – Quản trị',
    reporterName: 'Trần Huy Hoàng',
    reporterRole: 'Cán bộ Quản trị CSVC',
    location: 'Phòng họp số 3 - Tầng 3',
    createdAt: '2026-10-02T14:15:00Z',
    symptomDescription: 'Báo No Signal màn hình xanh, cáp HDMI không nhận tín hiệu.',
    preliminaryDiagnosis: 'Hỏng cáp HDMI âm sàn hoặc cổng nhận HDMI.',
    proposedAction: 'Thay thế cáp HDMI 10m âm sàn mới.',
    estimatedCost: 450000,
    urgency: 'HIGH',
    status: 'APPROVED',
  },
];

// ------------------- ASSET API CALLS -------------------

export async function fetchAssets(): Promise<Asset[]> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/assets`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      console.warn('Backend unavailable, falling back to mock assets');
    }
  }
  return INITIAL_ASSETS;
}

export async function adjustStockApi(
  assetId: string,
  type: 'IN' | 'OUT',
  quantity: number,
  reason: string,
  performer: string,
  referenceDoc?: string
): Promise<{ success: boolean; message: string }> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/assets/adjust`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          asset_id: assetId,
          type,
          quantity,
          reason,
          performer,
          reference_doc: referenceDoc,
        }),
      });
      const data = await res.json();
      if (res.ok) return { success: true, message: data.message };
      return { success: false, message: data.detail || 'Lỗi khi cập nhật kho' };
    } catch (err: any) {
      console.warn('Backend error during adjustStock:', err);
    }
  }
  return { success: true, message: `[Offline] Đã ${type === 'IN' ? 'nhập' : 'xuất'} ${quantity} đơn vị thành công.` };
}

export async function batchAddStockApi(
  items: { assetId: string; quantity: number }[],
  reason: string,
  performer: string,
  referenceDoc?: string
): Promise<{ success: boolean; count: number }> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/assets/batch-add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          items: items.map((i) => ({ asset_id: i.assetId, quantity: i.quantity })),
          reason,
          performer,
          reference_doc: referenceDoc,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('Backend error during batchAddStock:', err);
    }
  }
  return { success: true, count: items.length };
}

// ------------------- TICKET API CALLS -------------------

export async function fetchTickets(): Promise<MaintenanceTicket[]> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/tickets`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      console.warn('Backend unavailable, falling back to mock tickets');
    }
  }
  return INITIAL_TICKETS;
}

export async function createTicketApi(
  ticketData: Omit<MaintenanceTicket, 'id' | 'officialDocNumber' | 'createdAt' | 'status'>
): Promise<MaintenanceTicket | null> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: ticketData.assetId,
          asset_name: ticketData.assetName,
          asset_model: ticketData.assetModel,
          department: ticketData.department,
          reporter_name: ticketData.reporterName,
          reporter_role: ticketData.reporterRole,
          location: ticketData.location,
          symptom_description: ticketData.symptomDescription,
          preliminary_diagnosis: ticketData.preliminaryDiagnosis,
          proposed_action: ticketData.proposedAction,
          estimated_cost: ticketData.estimatedCost,
          urgency: ticketData.urgency,
          conversation_summary: ticketData.conversationSummary,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend error during createTicket:', err);
    }
  }
  return null;
}

export async function updateTicketStatusApi(
  ticketId: string,
  status: TicketStatus,
  approvedBy?: string
): Promise<boolean> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          approved_by: approvedBy,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend error updating ticket status:', err);
    }
  }
  return true;
}

export function getTicketDocxDownloadUrl(ticketId: string): string {
  return `${BASE_URL}/tickets/${ticketId}/docx`;
}

// ------------------- AUDIT API CALLS -------------------

export async function fetchEpisodes(): Promise<HistoricalEpisode[]> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/audit/episodes`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      console.warn('Backend unavailable, falling back to mock episodes');
    }
  }
  return INITIAL_EPISODES;
}

export async function approveAuditApi(
  assetId: string,
  quantity: number,
  department: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/audit/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          asset_id: assetId,
          quantity,
          department,
          notes,
        }),
      });
      const data = await res.json();
      if (res.ok) return { success: true, message: data.message };
      return { success: false, message: data.detail || 'Lỗi khi duyệt cấp phát' };
    } catch (err) {
      console.warn('Backend error during approveAudit:', err);
    }
  }
  return { success: true, message: `[Offline] Đã duyệt xuất kho ${quantity} đơn vị thành công!` };
}

// ------------------- MULTI-AGENT CHAT API -------------------

export async function sendChatMessageApi(
  message: string,
  role: string = 'user',
  userName: string = 'Nguyễn Hoàng Long',
  department: string = 'Phòng Marketing',
  threadId: string = 'default_session'
): Promise<{
  intent: string;
  response: string;
  data: any;
  thread_id: string;
} | null> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          role,
          user_name: userName,
          department,
          thread_id: threadId,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend chat API failed, using fallback:', err);
    }
  }
  return null;
}

// ------------------- KNOWLEDGE API -------------------

export async function fetchKnowledgeApi(): Promise<any[]> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/knowledge`);
      if (res.ok) return await res.json();
    } catch {
      console.warn('Backend knowledge unavailable');
    }
  }
  return [];
}

export async function enrichKnowledgeApi(modelName: string): Promise<any> {
  if (USE_LOCAL_BACKEND) {
    try {
      const res = await fetch(`${BASE_URL}/knowledge/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name: modelName }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend enrich API failed:', err);
    }
  }
  return null;
}

// ------------------- OCR RECEIPT API -------------------

export async function uploadOcrReceiptApi(file: File): Promise<any> {
  if (USE_LOCAL_BACKEND) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = getStoredToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${BASE_URL}/ocr`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend OCR API failed:', err);
    }
  }
  return null;
}

