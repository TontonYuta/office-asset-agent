import React, { useState } from 'react';
import { X, CheckCircle2, ScanLine, AlertCircle } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { formatVND } from '../../lib/formatters';

interface OCRItem {
  id: string;
  lineNumber: string;
  matchedAssetId: string;
  rawText: string;
  detectedName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  confidence: number;
}

interface OCRInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OCRInvoiceModal({ isOpen, onClose }: OCRInvoiceModalProps) {
  const { batchAddStock } = useInventory();
  const { profile, isAdmin } = useAuth();

  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const invoiceItems: OCRItem[] = [
    {
      id: 'item-01',
      lineNumber: 'Dòng 01',
      matchedAssetId: 'VT-101',
      rawText: '01. Giấy in Double A khổ A4 70gsm (500 tờ/gam)',
      detectedName: 'Giấy in Double A A4 70gsm',
      quantity: 50,
      unit: 'Gam',
      unitPrice: 85000,
      totalAmount: 4250000,
      confidence: 0.985,
    },
    {
      id: 'item-02',
      lineNumber: 'Dòng 02',
      matchedAssetId: 'VT-102',
      rawText: '02. Hộp mực Canon Cartridge EP-303 chính hãng',
      detectedName: 'Hộp mực máy in Canon Cartridge 303',
      quantity: 10,
      unit: 'Hộp',
      unitPrice: 320000,
      totalAmount: 3200000,
      confidence: 0.962,
    },
    {
      id: 'item-03',
      lineNumber: 'Dòng 03',
      matchedAssetId: 'VT-104',
      rawText: '03. Pin AA Panasonic Alkaline LR6T (Vỉ 2 viên)',
      detectedName: 'Pin AA Panasonic Alkaline (Vỉ 2 viên)',
      quantity: 30,
      unit: 'Vỉ',
      unitPrice: 38000,
      totalAmount: 1140000,
      confidence: 0.991,
    },
  ];

  const totalInvoiceVal = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleApproveBatch = () => {
    if (!isAdmin) {
      alert('Chỉ Cán bộ Quản trị CSVC mới có quyền duyệt hóa đơn nhập kho.');
      return;
    }

    const res = batchAddStock(
      invoiceItems.map((item) => ({
        assetId: item.matchedAssetId,
        quantity: item.quantity,
      })),
      'Nhập kho theo Hóa đơn VAT số 008129 (Tự động nhận diện)',
      `${profile.name} (${profile.title})`,
      'HĐ-008129'
    );

    if (res.success) {
      setIsApproved(true);
      setSuccessMessage(
        `Đã nhập kho thành công cả 3 mặt hàng (${invoiceItems.reduce(
          (s, i) => s + i.quantity,
          0
        )} đơn vị). Số lượng kho đã được cộng tự động!`
      );
      setTimeout(() => {
        onClose();
        setIsApproved(false);
        setSuccessMessage(null);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <ScanLine className="w-4 h-4 text-zinc-500" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Kiểm Tra & Bóc Tách Hóa Đơn Mua Hàng Tự Động
              </h3>
              <p className="text-[11px] text-zinc-500">
                Hóa đơn GTGT số: 008129 · Ký hiệu: 1C26TBB · Bên bán: Công ty CP Thiết bị Văn phòng Đông Á
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage && (
          <div className="m-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-zinc-200 dark:border-zinc-800">
          {/* Bản scan hóa đơn trực quan */}
          <div className="lg:col-span-5 p-5 bg-zinc-100 dark:bg-zinc-950/60 flex flex-col items-center justify-center border-r border-zinc-200 dark:border-zinc-800 select-none">
            <div className="w-full max-w-[340px] aspect-[1/1.414] bg-white text-zinc-900 shadow-md rounded-xs border border-zinc-300 relative p-4 text-[10px] overflow-hidden flex flex-col justify-between">
              {/* Header hóa đơn */}
              <div className="border-b border-zinc-300 pb-2 space-y-0.5 text-center">
                <div className="font-bold text-[11px] uppercase tracking-wide">
                  HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                </div>
                <div className="text-[9px] text-zinc-600">Bản thể hiện hóa đơn điện tử</div>
                <div className="text-[9px] text-zinc-500">
                  Mẫu số: 01GTKT0/001 - Ký hiệu: 1C26TBB
                </div>
              </div>

              {/* Bounding box nhận diện từng dòng */}
              <div className="my-auto space-y-2 relative">
                {invoiceItems.map((item) => {
                  const isActive = activeBoxId === item.id;
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setActiveBoxId(item.id)}
                      onMouseLeave={() => setActiveBoxId(null)}
                      className={`relative p-2 rounded transition-all cursor-pointer border ${
                        isActive
                          ? 'border-zinc-900 bg-zinc-900/10'
                          : 'border-zinc-300 bg-zinc-50 hover:border-zinc-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-zinc-800 text-[9px]">{item.lineNumber}</span>
                        <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-medium">
                          Khớp {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="font-medium text-zinc-800 truncate">{item.rawText}</div>
                      <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
                        <span>Số lượng: {item.quantity} {item.unit}</span>
                        <span>Đơn giá: {formatVND(item.unitPrice, false)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer tổng tiền */}
              <div className="border-t border-zinc-300 pt-2 flex justify-between font-bold text-[10px]">
                <span>TỔNG CỘNG TIỀN THANH TOÁN:</span>
                <span>{formatVND(totalInvoiceVal, false)}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 mt-3 text-center">
              Khung viền tương ứng với từng dòng chữ bóc tách từ hóa đơn
            </div>
          </div>

          {/* Bảng đối chiếu kho */}
          <div className="lg:col-span-7 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Đối Chiếu Danh Mục Với Kho Hiện Tại
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Khớp chính xác cả 3 mặt hàng
                </span>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                      <th className="py-2.5 px-3">Mã kho</th>
                      <th className="py-2.5 px-3">Tên vật tư nhận diện</th>
                      <th className="py-2.5 px-3 text-right">Số lượng nhập</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {invoiceItems.map((item) => (
                      <tr
                        key={item.id}
                        onMouseEnter={() => setActiveBoxId(item.id)}
                        onMouseLeave={() => setActiveBoxId(null)}
                        className={`transition-colors cursor-pointer ${
                          activeBoxId === item.id
                            ? 'bg-zinc-100 dark:bg-zinc-800'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.matchedAssetId}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {item.detectedName}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            Độ khớp: {(item.confidence * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          +{item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {formatVND(item.unitPrice, !isAdmin)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                          {formatVND(item.totalAmount, !isAdmin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tổng tiền */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Tổng giá trị lô hàng nhập (đã gồm thuế VAT):
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {formatVND(totalInvoiceVal, !isAdmin)}
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                {isAdmin ? (
                  <span>Xác nhận duyệt sẽ tự động cộng số lượng vào 3 thẻ kho trên.</span>
                ) : (
                  <span className="italic">Chỉ Quản trị viên mới có quyền Duyệt Nhập Kho.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Đóng
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleApproveBatch}
                    disabled={isApproved}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Duyệt Nhập Kho (1 Chạm)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
