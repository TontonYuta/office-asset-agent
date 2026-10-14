import React from 'react';
import {
  MessageSquare,
  Package,
  Activity,
  FileCheck2,
  BookOpen,
  Shield,
  KeyRound,
  Lock,
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { kpi } = useInventory();
  const { tickets } = useTickets();
  const { profile, isAdmin, openLoginModal } = useAuth();

  const pendingTicketsCount = tickets.filter((t) => t.status === 'PENDING_APPROVAL').length;

  const generalNavItems = [
    {
      id: 'chat',
      label: 'Trợ Lý CSVC',
      sublabel: 'Hỏi tồn kho & hướng dẫn sửa máy',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'inventory',
      label: isAdmin ? 'Quản Lý Kho Vật Tư' : 'Danh Mục Vật Tư',
      sublabel: isAdmin ? 'Kiểm kê, nhập xuất & định giá' : 'Tra cứu số lượng sẵn sàng cấp',
      icon: Package,
      badge: kpi.lowStockCount > 0 ? `${kpi.lowStockCount} sắp hết` : null,
      badgeType: 'warning',
    },
    {
      id: 'tickets',
      label: isAdmin ? 'Xử Lý Phiếu Báo Hỏng' : 'Phiếu Báo Hỏng Của Tôi',
      sublabel: isAdmin ? 'Phê duyệt & phân công thợ sửa' : 'Gửi đề xuất sửa chữa thiết bị',
      icon: FileCheck2,
      badge: pendingTicketsCount > 0 ? `${pendingTicketsCount} chờ duyệt` : null,
      badgeType: 'alert',
    },
    {
      id: 'knowledge',
      label: 'Sổ Tay Thiết Bị',
      sublabel: 'Hướng dẫn sử dụng & mã lỗi',
      icon: BookOpen,
      badge: null,
    },
  ];

  const managerNavItems = [
    {
      id: 'audit',
      label: 'Phê Duyệt Cấp Phát',
      sublabel: 'Thẩm định định mức & duyệt xuất kho',
      icon: Activity,
      badge: isAdmin ? 'Quản lý' : 'Chỉ Quản lý 🔒',
      badgeType: isAdmin ? 'neutral' : 'locked',
    },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between shrink-0 select-none transition-colors">
      {/* Brand & Organization */}
      <div>
        <div className="h-16 px-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-xs">
            CS
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
              Quản Trị CSVC Doanh Nghiệp
            </div>
            <div className="text-[11px] text-zinc-500 truncate">
              {isAdmin ? 'Phòng Hành chính – Quản trị' : profile.department}
            </div>
          </div>
        </div>

        {/* Navigation Section 1: General for All Users */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Nghiệp vụ phòng ban
          </div>
          {generalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-white dark:text-zinc-900'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  />
                  <div className="truncate">
                    <div className="truncate leading-tight font-medium">{item.label}</div>
                    <div
                      className={`text-[10px] leading-tight truncate mt-0.5 ${
                        isActive
                          ? 'text-zinc-300 dark:text-zinc-600'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                        : item.badgeType === 'alert'
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                        : item.badgeType === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Navigation Section 2: Management & Approvals */}
          <div className="pt-3 px-3 py-1.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Dành cho Quản lý CSVC</span>
            {!isAdmin && <Lock className="w-3 h-3 text-zinc-400" />}
          </div>
          {managerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-white dark:text-zinc-900'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  />
                  <div className="truncate">
                    <div className="truncate leading-tight font-medium">{item.label}</div>
                    <div
                      className={`text-[10px] leading-tight truncate mt-0.5 ${
                        isActive
                          ? 'text-zinc-300 dark:text-zinc-600'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                        : item.badgeType === 'locked'
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile info footer with Role Indicator & Switcher */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Vai trò tài khoản</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                isAdmin
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {profile.roleLabel}
            </span>
          </div>

          <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {profile.name}
          </div>

          <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
            <span>Duyệt xuất kho & giá:</span>
            <span className={isAdmin ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-400 italic'}>
              {isAdmin ? 'Được phép' : 'Đã khóa'}
            </span>
          </div>

          {!isAdmin && (
            <button
              onClick={openLoginModal}
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded text-[11px] font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
            >
              <KeyRound className="w-3 h-3" />
              <span>Đăng nhập Quản lý</span>
            </button>
          )}
        </div>

        <div className="px-1 text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
          Văn bản hành chính chuẩn Nghị định 30/2020/NĐ-CP
        </div>
      </div>
    </aside>
  );
}
