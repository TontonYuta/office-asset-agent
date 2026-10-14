import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Asset } from '../../types/asset';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { formatVND } from '../../lib/formatters';

interface StockAdjustmentModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StockAdjustmentModal({ asset, isOpen, onClose }: StockAdjustmentModalProps) {
  const { adjustStock } = useInventory();
  const { profile, isAdmin } = useAuth();

  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [referenceDoc, setReferenceDoc] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isAdmin) {
      setErrorMsg('Đồng chí không có quyền điều chỉnh kho. Chỉ Quản trị viên CSVC mới được thực hiện.');
      return;
    }

    if (quantity <= 0) {
      setErrorMsg('Số lượng phải lớn hơn 0.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Vui lòng ghi rõ lý do nhập / xuất kho.');
      return;
    }

    const res = adjustStock(
      asset.id,
      type,
      quantity,
      reason.trim(),
      `${profile.name} (${profile.title})`,
      referenceDoc.trim() || undefined
    );

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        setReason('');
        setReferenceDoc('');
        setQuantity(1);
      }, 1000);
    }
  };

  const projectedStock =
    type === 'IN' ? asset.currentStock + (quantity || 0) : asset.currentStock - (quantity || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Điều Chỉnh Nhập / Xuất Kho
            </h3>
            <p className="text-[11px] text-zinc-500">
              Mã: {asset.id} · {asset.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thống kê tồn kho trước & sau */}
        <div className="grid grid-cols-3 gap-2 px-5 py-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <div>
            <div className="text-[11px] text-zinc-500">Tồn kho hiện tại</div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              {asset.currentStock} {asset.unit}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-500">Mức dự phòng an toàn</div>
            <div className="text-zinc-600 dark:text-zinc-400 font-medium">
              {asset.minSafeStock} {asset.unit}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-500">Dự kiến sau khi lưu</div>
            <div
              className={`font-bold text-sm ${
                projectedStock < 0
                  ? 'text-red-600 dark:text-red-400'
                  : projectedStock < asset.minSafeStock
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {projectedStock} {asset.unit}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Chọn loại nghiệp vụ: Nhập / Xuất */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Loại nghiệp vụ kho
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('IN')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium border transition-colors ${
                  type === 'IN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-600 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                <span>Nhập kho thêm (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('OUT')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium border transition-colors ${
                  type === 'OUT'
                    ? 'border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-600 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-amber-600" />
                <span>Xuất kho cấp phát (-)</span>
              </button>
            </div>
          </div>

          {/* Số lượng & Chứng từ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Số lượng ({asset.unit}) *
              </label>
              <input
                type="number"
                min={1}
                max={type === 'OUT' ? asset.currentStock : 10000}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Số Hóa đơn / Số Phiếu
              </label>
              <input
                type="text"
                placeholder="VD: HĐ-008129, CP-MKT-01"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Lý do */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Lý do điều chỉnh kho *
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Nhập hàng định kỳ tháng; Xuất cho phòng ban sử dụng..."
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 resize-none text-zinc-900 dark:text-zinc-100"
              required
            />
          </div>

          {/* Cán bộ thực hiện */}
          <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Cán bộ thực hiện:</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {profile.name} ({profile.title})
            </span>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
            >
              Xác Nhận Lưu Kho
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
