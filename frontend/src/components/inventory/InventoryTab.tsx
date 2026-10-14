import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  Monitor,
  CircleDollarSign,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Lock,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { Asset, AssetCategory, StockStatus, STOCK_STATUS_LABELS } from '../../types/asset';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { formatVND, formatNumber, formatDateTimeVN } from '../../lib/formatters';
import { StockAdjustmentModal } from './StockAdjustmentModal';

interface InventoryTabProps {
  onSelectForAudit?: (assetId: string) => void;
  selectedAssetId?: string | null;
}

export function InventoryTab({ onSelectForAudit, selectedAssetId }: InventoryTabProps) {
  const { assets, kpi, transactions } = useInventory();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'stock' | 'price'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeSubView, setActiveSubView] = useState<'table' | 'history'>('table');

  // Modal state
  const [adjustingAsset, setAdjustingAsset] = useState<Asset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        const matchesSearch =
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCat =
          selectedCategory === 'ALL' || asset.category === selectedCategory;

        const matchesStatus =
          selectedStatus === 'ALL' || asset.status === selectedStatus;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'id') diff = a.id.localeCompare(b.id);
        else if (sortBy === 'name') diff = a.name.localeCompare(b.name);
        else if (sortBy === 'stock') diff = a.currentStock - b.currentStock;
        else if (sortBy === 'price') diff = a.unitPrice - b.unitPrice;

        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [assets, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const handleOpenAdjust = (asset: Asset) => {
    setAdjustingAsset(asset);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {STOCK_STATUS_LABELS.AVAILABLE}
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {STOCK_STATUS_LABELS.LOW_STOCK}
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {STOCK_STATUS_LABELS.MAINTENANCE}
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            {STOCK_STATUS_LABELS.OUT_OF_STOCK}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Thẻ thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tổng danh mục</span>
            <Package className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {kpi.totalItems}
            </span>
            <span className="text-xs text-zinc-500">loại vật tư & thiết bị</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            Tổng cộng: <strong className="text-zinc-700 dark:text-zinc-300">{kpi.totalQuantity}</strong> đơn vị đang lưu kho
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Vật tư tiêu hao</span>
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {kpi.consumablesCount}
            </span>
            <span className="text-xs text-zinc-500">loại giấy / mực / pin</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            {kpi.lowStockCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Cảnh báo: {kpi.lowStockCount} loại sắp hết mức dự phòng
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">Định mức an toàn ổn định</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Thiết bị văn phòng</span>
            <Monitor className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {kpi.sharedDevicesCount}
            </span>
            <span className="text-xs text-zinc-500">máy in / chiếu / mic</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            Kiểm kê và bảo dưỡng định kỳ 6 tháng/lần
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tổng giá trị tồn kho</span>
            {isAdmin ? (
              <CircleDollarSign className="w-4 h-4 text-zinc-400" />
            ) : (
              <Lock className="w-4 h-4 text-zinc-400" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {formatVND(kpi.totalValuation, !isAdmin)}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            {isAdmin ? (
              <span className="text-zinc-500">Toàn quyền xem giá trị thực tế</span>
            ) : (
              <span className="text-zinc-400 italic">Đã bảo mật theo quyền Nhân viên</span>
            )}
          </div>
        </div>
      </div>

      {/* Thanh công cụ tìm kiếm và lọc */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Nút chuyển chế độ xem: Danh sách / Nhật ký */}
          <div className="flex items-center p-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
            <button
              onClick={() => setActiveSubView('table')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeSubView === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Danh Sách Tồn Kho ({filteredAssets.length})
            </button>
            <button
              onClick={() => setActiveSubView('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
                activeSubView === 'history'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch Sử Nhập / Xuất ({transactions.length})</span>
            </button>
          </div>

          <div className="text-xs text-zinc-500">
            Đang hiển thị {filteredAssets.length} trên tổng {assets.length} loại
          </div>
        </div>

        {activeSubView === 'table' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            {/* Ô tìm kiếm */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã kho, tên, vị trí để..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Lọc danh mục */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
              >
                <option value="ALL">Tất cả nhóm vật tư</option>
                <option value="Vật tư tiêu hao">Vật tư tiêu hao</option>
                <option value="Thiết bị văn phòng">Thiết bị văn phòng</option>
                <option value="Thiết bị dùng chung">Thiết bị dùng chung</option>
              </select>
            </div>

            {/* Lọc tình trạng kho */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
              >
                <option value="ALL">Tất cả trạng thái kho</option>
                <option value="AVAILABLE">Sẵn sàng cấp phát</option>
                <option value="LOW_STOCK">Sắp hết (Cần mua bổ sung)</option>
                <option value="MAINTENANCE">Đang bảo dưỡng / Sửa chữa</option>
                <option value="OUT_OF_STOCK">Hết hàng</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-700 dark:text-zinc-300"
              >
                <option value="id">Sắp xếp: Mã kho</option>
                <option value="name">Sắp xếp: Tên vật tư</option>
                <option value="stock">Sắp xếp: Số lượng tồn</option>
                <option value="price">Sắp xếp: Đơn giá</option>
              </select>
              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                title="Đổi chiều sắp xếp"
                className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bảng dữ liệu chính */}
      {activeSubView === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Mã kho</th>
                  <th className="py-3 px-4">Tên vật tư & Chủng loại</th>
                  <th className="py-3 px-4">Nhóm</th>
                  <th className="py-3 px-4">Vị trí lưu kho</th>
                  <th className="py-3 px-4 text-right">Tồn kho / Mức an toàn</th>
                  <th className="py-3 px-4">Đơn vị</th>
                  <th className="py-3 px-4 text-right">Đơn giá</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-zinc-500 italic">
                      Không tìm thấy vật tư nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const isHighlighted = selectedAssetId === asset.id;
                    return (
                      <tr
                        key={asset.id}
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                          isHighlighted ? 'bg-zinc-100 dark:bg-zinc-800/70' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {asset.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {asset.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {asset.model}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                          {asset.category}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-[11px]">
                          {asset.location}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-semibold ${
                              asset.currentStock <= asset.minSafeStock
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                          >
                            {asset.currentStock}
                          </span>
                          <span className="text-zinc-400"> / {asset.minSafeStock}</span>
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                          {asset.unit}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatVND(asset.unitPrice, !isAdmin)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getStatusBadge(asset.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isAdmin ? (
                              <button
                                onClick={() => handleOpenAdjust(asset)}
                                className="px-2.5 py-1 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[11px] font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
                              >
                                Nhập / Xuất
                              </button>
                            ) : null}
                            {onSelectForAudit && (
                              <button
                                onClick={() => onSelectForAudit(asset.id)}
                                className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                Thẩm định
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Lịch sử giao dịch nhập xuất kho */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden transition-colors">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Lịch Sử Giao Dịch Nhập / Xuất Kho
            </span>
            <span className="text-xs text-zinc-500">
              Tổng số {transactions.length} lượt giao dịch
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Mã giao dịch</th>
                  <th className="py-2.5 px-4">Thời gian</th>
                  <th className="py-2.5 px-4">Tên vật tư</th>
                  <th className="py-2.5 px-4">Loại giao dịch</th>
                  <th className="py-2.5 px-4 text-right">Số lượng</th>
                  <th className="py-2.5 px-4 text-right">Tồn cũ → mới</th>
                  <th className="py-2.5 px-4">Người thực hiện</th>
                  <th className="py-2.5 px-4">Lý do & Số hiệu phiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-2.5 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      {txn.id}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-500 whitespace-nowrap">
                      {formatDateTimeVN(txn.timestamp)}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {txn.assetName}
                      </div>
                      <div className="text-[10px] text-zinc-400">Mã kho: {txn.assetId}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      {txn.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          NHẬP KHO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          XUẤT KHO
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold">
                      {txn.type === 'IN' ? `+${txn.quantity}` : `-${txn.quantity}`}
                    </td>
                    <td className="py-2.5 px-4 text-right text-zinc-500">
                      {txn.previousStock} → {txn.newStock}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-700 dark:text-zinc-300">
                      {txn.performedBy}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-400">
                      <div>{txn.reason}</div>
                      {txn.referenceDoc && (
                        <div className="text-[10px] text-zinc-400">
                          Số chứng từ: {txn.referenceDoc}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal điều chỉnh kho */}
      <StockAdjustmentModal
        asset={adjustingAsset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
