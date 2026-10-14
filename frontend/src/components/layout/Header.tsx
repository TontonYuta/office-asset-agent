import React from 'react';
import { Search, Shield, User, ArrowRightLeft, Sun, Moon, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  activeTab: string;
  onOpenCommand: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  chat: {
    title: 'Trợ Lý Tự Động CSVC',
    subtitle: 'Hỏi đáp tồn kho, hướng dẫn tự sửa thiết bị và đề xuất phân bổ',
  },
  inventory: {
    title: 'Quản Lý Kho Vật Tư & Thiết Bị',
    subtitle: 'Theo dõi tồn kho thực tế, định mức dự phòng an toàn và lịch sử nhập xuất',
  },
  audit: {
    title: 'Thẩm Định Định Mức Cấp Phát',
    subtitle: 'Đánh giá số lượng yêu cầu bằng công thức toán học và dữ liệu quá khứ',
  },
  tickets: {
    title: 'Phiếu Báo Hỏng & Đề Nghị Bảo Trì',
    subtitle: 'Quản lý phiếu sửa chữa theo thể thức văn bản hành chính Nghị định 30/2020',
  },
  knowledge: {
    title: 'Sổ Tay Hướng Dẫn & Bảng Mã Lỗi',
    subtitle: 'Quy trình sử dụng chuẩn 3 bước và cách tự xử lý sự cố thiết bị nhanh',
  },
};

export function Header({ activeTab, onOpenCommand }: HeaderProps) {
  const { role, profile, toggleRole, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const current = TAB_TITLES[activeTab] || TAB_TITLES.chat;

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Title & Current Page */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {current.title}
            </h1>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Center Search / Command Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span>Tìm nhanh vật tư, mã lỗi, phiếu đề xuất...</span>
          </span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Theme Toggle & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Chuyển sang giao diện Tối' : 'Chuyển sang giao diện Sáng'}
          className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Đổi chế độ sáng tối"
        >
          {theme === 'light' ? (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Moon className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden xl:inline text-[11px]">Chế độ Tối</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline text-[11px]">Chế độ Sáng</span>
            </div>
          )}
        </button>

        {/* User Profile & Role Switcher */}
        <div className="flex items-center gap-2 pl-3 border-l border-zinc-200 dark:border-zinc-800">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {profile.name}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  isAdmin
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {profile.roleLabel}
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px]">
              {profile.department}
            </div>
          </div>

          <button
            onClick={toggleRole}
            title={`Đang là vai trò ${profile.roleLabel}. Nhấn để chuyển sang ${isAdmin ? 'Nhân viên' : 'Quản trị viên'}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px]">Đổi vai trò</span>
          </button>
        </div>
      </div>
    </header>
  );
}
