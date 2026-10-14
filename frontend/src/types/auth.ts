export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  username?: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  title: string;
  clearanceLabel: string;
  canViewValuations: boolean;
  canAdjustStock: boolean;
  canApproveAIMRM: boolean;
  canApproveTickets: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

export const USER_PROFILES: Record<UserRole, UserProfile> = {
  user: {
    id: 'NV-MKT-089',
    name: 'Nguyễn Hoàng Long',
    role: 'user',
    roleLabel: 'Nhân viên',
    department: 'Phòng Truyền thông & Tiếp thị',
    title: 'Chuyên viên Truyền thông',
    clearanceLabel: 'Cán bộ phòng ban',
    canViewValuations: false, // Ẩn giá: •••••• VNĐ
    canAdjustStock: false,
    canApproveAIMRM: false,
    canApproveTickets: false,
  },
  admin: {
    id: 'CB-HCQT-001',
    name: 'Trần Huy Hoàng',
    role: 'admin',
    roleLabel: 'Quản trị viên',
    department: 'Phòng Hành chính – Quản trị Cơ sở vật chất',
    title: 'Phó Trưởng phòng Quản trị CSVC',
    clearanceLabel: 'Quản trị viên Toàn quyền',
    canViewValuations: true,
    canAdjustStock: true,
    canApproveAIMRM: true,
    canApproveTickets: true,
  },
};
