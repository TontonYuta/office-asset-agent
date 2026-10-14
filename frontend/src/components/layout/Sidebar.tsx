import React from 'react';
import {
  MessageSquare,
  Package,
  Activity,
  FileCheck2,
  BookOpen,
  Layers,
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
  const { profile, isAdmin } = useAuth();

  const pendingTicketsCount = tickets.filter((t) => t.status === 'PENDING_APPROVAL').length;

  const navItems = [
    {
      id: 'chat',
      label: 'Trợ Lý Tự Động',
      sublabel: 'Hỏi đáp tồn kho & lỗi máy',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'inventory',
      label: 'Kho Vật Tư & Thiết Bị',
      sublabel: 'Danh mục, số lượng & thẻ kho',
      icon: Package,
      badge: kpi.lowStockCount > 0 ? `${kpi.lowStockCount} sắp hết` : null,
      badgeType: 'warning',
    },
    {
      id: 'audit',
      label: 'Thẩm Định Cấp Phát',
      sublabel: 'Kiểm tra định mức an toàn',
      icon: Activity,
      badge: 'Công thức',
      badgeType: 'neutral',
    },
    {
      id: 'tickets',
      label: 'Phiếu Báo Hỏng',
      sublabel: 'Văn bản chuẩn Nghị định 30',
      icon: FileCheck2,
      badge: pendingTicketsCount > 0 ? `${pendingTicketsCount} chờ duyệt` : null,
      badgeType: 'alert',
    },
    {
      id: 'knowledge',
      label: 'Sổ Tay Thiết Bị',
      sublabel: 'Cách dùng & sửa lỗi tại chỗ',
      icon: BookOpen,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between shrink-0 select-none transition-colors">
      {/* Brand & Organization */}
      <div>
        <div className="h-16 px-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-xs">
            VT
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
              Quản Trị Vật Tư CSVC
            </div>
            <div className="text-[11px] text-zinc-500 truncate">
              Hệ thống Hành chính Doanh nghiệp
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Chức năng chính
          </div>
          {navItems.map((item) => {
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
                        : 'text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500'
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
        </div>
      </div>

      {/* Profile info footer */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Quyền hạn</span>
            <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              {profile.clearanceLabel}
            </span>
          </div>
          <div className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {profile.name}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 flex items-center justify-between">
            <span>Xem giá tiền:</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {isAdmin ? 'Được phép xem' : 'Đã ẩn bảo mật'}
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Nhập / xuất kho:</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {isAdmin ? 'Toàn quyền' : 'Chỉ xem'}
            </span>
          </div>
        </div>

        <div className="px-1 text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
          Văn bản hành chính chuẩn Nghị định 30/2020/NĐ-CP
        </div>
      </div>
    </aside>
  );
}
