import React, { useState, useEffect, useMemo } from 'react';
import { Search, Package, FileText, Cpu, Wrench, UserCheck, Shield, X } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { formatVND } from '../../lib/formatters';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  onSelectAsset?: (assetId: string) => void;
}

export function CommandMenu({ isOpen, onClose, setActiveTab, onSelectAsset }: CommandMenuProps) {
  const [query, setQuery] = useState('');
  const { assets } = useInventory();
  const { role, setRole, isAdmin } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredAssets = useMemo(() => {
    if (!query.trim()) return assets.slice(0, 4);
    const q = query.toLowerCase();
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [assets, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-zinc-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm vật tư, thiết bị, chuyển trang hoặc đổi vai trò..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
            Esc
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3">
          {/* Section: Assets */}
          <div>
            <div className="px-2 py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Vật tư & Thiết bị trong kho ({filteredAssets.length})
            </div>
            <div className="space-y-0.5 mt-1">
              {filteredAssets.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-500 italic">Không tìm thấy vật tư nào phù hợp.</div>
              ) : (
                filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => {
                      setActiveTab('inventory');
                      if (onSelectAsset) onSelectAsset(asset.id);
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Package className="w-4 h-4 text-zinc-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">
                          Mã: {asset.id} · {asset.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        {asset.currentStock} {asset.unit}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {formatVND(asset.unitPrice, !isAdmin)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Section: Quick Navigation */}
          <div>
            <div className="px-2 py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Chuyển nhanh đến chức năng
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                onClick={() => {
                  setActiveTab('chat');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span>Trợ lý hỏi đáp tự động</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('inventory');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <Package className="w-3.5 h-3.5 text-zinc-400" />
                <span>Kho vật tư & thiết bị</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('audit');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>Thẩm định định mức cấp phát</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('tickets');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Phiếu báo hỏng (Nghị định 30)</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('knowledge');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left col-span-2"
              >
                <Wrench className="w-3.5 h-3.5 text-zinc-400" />
                <span>Sổ tay hướng dẫn & bảng mã lỗi</span>
              </button>
            </div>
          </div>

          {/* Section: Role Switcher Shortcut */}
          <div>
            <div className="px-2 py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Chọn vai trò sử dụng
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  setRole('user');
                  onClose();
                }}
                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-md border text-xs text-left transition-colors ${
                  role === 'user'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div>
                  <div className="font-medium">Nhân viên: Nguyễn Hoàng Long</div>
                  <div className="text-[10px] opacity-75">Phòng Truyền thông · Giá tiền được ẩn</div>
                </div>
                <UserCheck className="w-4 h-4 shrink-0" />
              </button>
              <button
                onClick={() => {
                  setRole('admin');
                  onClose();
                }}
                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-md border text-xs text-left transition-colors ${
                  role === 'admin'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div>
                  <div className="font-medium">Quản trị viên: Trần Huy Hoàng</div>
                  <div className="text-[10px] opacity-75">Phòng Hành chính CSVC · Toàn quyền</div>
                </div>
                <Shield className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Nhấn phím Esc hoặc bấm ra ngoài để đóng</span>
          <span>Phím tắt mở: Ctrl+K / ⌘K</span>
        </div>
      </div>
    </div>
  );
}
