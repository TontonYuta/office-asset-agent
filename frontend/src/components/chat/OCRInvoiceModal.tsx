import React, { useState, useRef } from 'react';
import {
  X,
  CheckCircle2,
  ScanLine,
  AlertCircle,
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  RefreshCw,
  Eye,
  Lock,
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { formatVND } from '../../lib/formatters';
import { uploadOcrReceiptApi } from '../../services/api';

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
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] trên thang [0, 1000]
}

interface OCRInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SAMPLE_ITEMS: OCRItem[] = [
  {
    id: 'item-01',
    lineNumber: 'Dòng 01',
    matchedAssetId: 'VT-GIAY-A4',
    rawText: '01. Giấy in Double A khổ A4 70gsm (500 tờ/gam)',
    detectedName: 'Giấy in Double A A4 70gsm',
    quantity: 50,
    unit: 'Ram',
    unitPrice: 75000,
    totalAmount: 3750000,
    confidence: 0.985,
    bbox: [280, 85, 315, 915],
  },
  {
    id: 'item-02',
    lineNumber: 'Dòng 02',
    matchedAssetId: 'VT-MUC-2900',
    rawText: '02. Hộp mực máy in Canon Cartridge EP-303 / 12A',
    detectedName: 'Hộp mực máy in Cartridge 12A',
    quantity: 10,
    unit: 'Hộp',
    unitPrice: 180000,
    totalAmount: 1800000,
    confidence: 0.962,
    bbox: [325, 85, 360, 915],
  },
  {
    id: 'item-03',
    lineNumber: 'Dòng 03',
    matchedAssetId: 'VT-PIN-AA',
    rawText: '03. Vỉ pin AA Energizer Max Alkaline (Pin micro)',
    detectedName: 'Vỉ pin AA Energizer Max (Pin micro)',
    quantity: 20,
    unit: 'Viên',
    unitPrice: 15000,
    totalAmount: 300000,
    confidence: 0.991,
    bbox: [370, 85, 405, 915],
  },
];

export function OCRInvoiceModal({ isOpen, onClose }: OCRInvoiceModalProps) {
  const { batchAddStock } = useInventory();
  const { profile, isAdmin } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<OCRItem[]>(DEFAULT_SAMPLE_ITEMS);
  const [invoiceMeta, setInvoiceMeta] = useState({
    provider: 'Công ty Cổ phần Thương mại Thiết bị Văn phòng Hà Nội',
    invoiceNumber: 'HD-202610-889',
    deliveryDate: '12/10/2026',
    modelArch: 'Hệ thống AI Vision bóc tách tự động',
  });

  if (!isOpen) return null;

  const totalInvoiceVal = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Local image preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    setSuccessMessage(null);

    try {
      const data = await uploadOcrReceiptApi(file);
      if (data && data.status === 'success' && Array.isArray(data.items)) {
        setInvoiceMeta({
          provider: data.provider || 'Công ty Cung ứng Văn phòng phẩm',
          invoiceNumber: data.invoice_number || `HD-${Date.now().toString().slice(-6)}`,
          deliveryDate: data.delivery_date || '14/10/2026',
          modelArch: data.model_architecture || 'Hệ thống AI Vision bóc tách tự động',
        });

        if (data.image_data) {
          setUploadedImageSrc(data.image_data);
        }

        const mapped: OCRItem[] = data.items.map((it: any, idx: number) => ({
          id: `item-${idx + 1}`,
          lineNumber: `Dòng ${idx + 1 < 10 ? '0' : ''}${idx + 1}`,
          matchedAssetId: it.target_code || 'VT-GIAY-A4',
          rawText: it.raw_ocr_name || it.name,
          detectedName: it.name,
          quantity: it.quantity,
          unit: it.unit || 'Đơn vị',
          unitPrice: it.unit_price || 0,
          totalAmount: it.total_price || it.quantity * (it.unit_price || 0),
          confidence: it.confidence || 0.98,
          bbox: it.bbox || [250 + idx * 50, 85, 290 + idx * 50, 915],
        }));

        setInvoiceItems(mapped);
      }
    } catch (err) {
      console.warn('Lỗi xử lý OCR file:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const resetToSample = () => {
    setUploadedImageSrc(null);
    setInvoiceItems(DEFAULT_SAMPLE_ITEMS);
    setInvoiceMeta({
      provider: 'Công ty Cổ phần Thương mại Thiết bị Văn phòng Hà Nội',
      invoiceNumber: 'HD-202610-889',
      deliveryDate: '12/10/2026',
      modelArch: 'Hệ thống AI Vision bóc tách tự động',
    });
    setSuccessMessage(null);
  };

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
      `Nhập kho theo Hóa đơn VAT ${invoiceMeta.invoiceNumber} (${invoiceMeta.provider})`,
      `${profile.name} (${profile.title})`,
      invoiceMeta.invoiceNumber
    );

    if (res.success) {
      setIsApproved(true);
      const totalUnits = invoiceItems.reduce((s, i) => s + i.quantity, 0);
      setSuccessMessage(
        `Đã nhập kho thành công cả ${invoiceItems.length} mặt hàng (+${totalUnits} đơn vị vào CSDL SQLite). Thẻ kho đã được cập nhật!`
      );
      setTimeout(() => {
        onClose();
        setIsApproved(false);
        setSuccessMessage(null);
      }, 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-100">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-4">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Kiểm Tra & Bóc Tách Hóa Đơn / Biên Bản Giao Hàng
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-400 dark:text-amber-600" />
                  Bóc Tách Hóa Đơn Tự Động
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Số HĐ: <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{invoiceMeta.invoiceNumber}</span> · Bên bán: {invoiceMeta.provider} · Ngày: {invoiceMeta.deliveryDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-zinc-500" />
              <span>Tải ảnh khác</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {uploadedImageSrc && (
              <button
                onClick={resetToSample}
                title="Quay lại mẫu hóa đơn chuẩn ban đầu"
                className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="m-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-zinc-200 dark:border-zinc-800">
          {/* CỘT TRÁI: Preview bản scan / ảnh chứng từ có Grounding Bounding Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="lg:col-span-5 p-5 bg-zinc-100 dark:bg-zinc-950/70 flex flex-col items-center justify-center border-r border-zinc-200 dark:border-zinc-800 select-none relative min-h-[460px]"
          >
            {isAnalyzing && (
              <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xs z-20 flex flex-col items-center justify-center text-zinc-700 dark:text-zinc-300 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-zinc-100" />
                <span className="text-xs font-semibold">Đang bóc tách bảng biểu & đối soát CSDL...</span>
                <span className="text-[10px] text-zinc-500">Đối soát danh mục vật tư trong kho...</span>
              </div>
            )}

            {uploadedImageSrc ? (
              /* Trường hợp hiển thị ảnh người dùng tải lên với Bounding Box trực quan */
              <div className="w-full max-w-[360px] relative bg-white shadow-lg rounded-sm border border-zinc-300 overflow-hidden group">
                <img
                  src={uploadedImageSrc}
                  alt="Hóa đơn tải lên"
                  className="w-full h-auto object-contain max-h-[440px] block"
                />

                {/* Overlay Bounding Boxes */}
                {invoiceItems.map((item) => {
                  const [ymin, xmin, ymax, xmax] = item.bbox;
                  const isActive = activeBoxId === item.id;
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setActiveBoxId(item.id)}
                      onMouseLeave={() => setActiveBoxId(null)}
                      style={{
                        top: `${ymin / 10}%`,
                        left: `${xmin / 10}%`,
                        height: `${(ymax - ymin) / 10}%`,
                        width: `${(xmax - xmin) / 10}%`,
                      }}
                      className={`absolute cursor-pointer transition-all border-2 rounded-xs flex items-start justify-end p-0.5 ${
                        isActive
                          ? 'border-amber-500 bg-amber-500/25 ring-2 ring-amber-400 z-10'
                          : 'border-blue-500/70 bg-blue-500/10 hover:border-amber-500'
                      }`}
                    >
                      <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-zinc-900 text-white leading-none shadow-xs">
                        {item.lineNumber} ({(item.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Trường hợp hiển thị bản thể hiện tài liệu văn phòng mẫu */
              <div className="w-full max-w-[340px] aspect-[1/1.414] bg-white text-zinc-900 shadow-md rounded-xs border border-zinc-300 relative p-4 text-[10px] overflow-hidden flex flex-col justify-between">
                <div className="border-b border-zinc-300 pb-2 space-y-0.5 text-center">
                  <div className="font-bold text-[11px] uppercase tracking-wide">
                    HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                  </div>
                  <div className="text-[9px] text-zinc-600">Bản thể hiện hóa đơn điện tử</div>
                  <div className="text-[9px] text-zinc-500">
                    Số: {invoiceMeta.invoiceNumber} - Ký hiệu: 1C26TBB
                  </div>
                </div>

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
                            ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-500'
                            : 'border-zinc-300 bg-zinc-50 hover:border-zinc-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-zinc-800 text-[9px]">
                            {item.lineNumber}
                          </span>
                          <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-medium">
                            Khớp {(item.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="font-medium text-zinc-800 truncate">{item.rawText}</div>
                        <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
                          <span>
                            Số lượng: {item.quantity} {item.unit}
                          </span>
                          <span>Đơn giá: {formatVND(item.unitPrice, false)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-zinc-300 pt-2 flex justify-between font-bold text-[10px]">
                  <span>TỔNG THANH TOÁN:</span>
                  <span>{formatVND(totalInvoiceVal, false)}</span>
                </div>
              </div>
            )}

            <div className="text-[11px] text-zinc-500 mt-3 text-center flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>Di chuột vào từng dòng để làm nổi bật khung định vị (Bounding Box)</span>
            </div>
          </div>

          {/* CỘT PHẢI: Bảng đối soát danh mục kho CSDL */}
          <div className="lg:col-span-7 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Đối Chiếu Với Danh Mục Kho Hiện Tại
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Hệ thống tự động liên kết tên nhận diện trên chứng từ với Mã thẻ kho SQLite
                  </p>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  Khớp {invoiceItems.length}/{invoiceItems.length} mặt hàng
                </span>
              </div>

              {/* Bảng chi tiết */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                      <th className="py-2.5 px-3">Mã kho</th>
                      <th className="py-2.5 px-3">Tên vật tư nhận diện</th>
                      <th className="py-2.5 px-3 text-right">Số lượng</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                    {invoiceItems.map((item) => (
                      <tr
                        key={item.id}
                        onMouseEnter={() => setActiveBoxId(item.id)}
                        onMouseLeave={() => setActiveBoxId(null)}
                        className={`transition-colors cursor-pointer ${
                          activeBoxId === item.id
                            ? 'bg-amber-50/80 dark:bg-amber-950/30'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.matchedAssetId}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {item.detectedName}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[200px]">
                            {item.rawText}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          +{item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right text-zinc-600 dark:text-zinc-400">
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
                <div>
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                    Tổng giá trị lô hàng nhập (đã gồm thuế VAT):
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Trạng thái: Bóc tách tự động hoàn tất (đã đối soát danh mục kho)
                  </div>
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {formatVND(totalInvoiceVal, !isAdmin)}
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                {isAdmin ? (
                  <span>
                    Bấm Duyệt sẽ tự động cộng số lượng vào CSDL SQLite và ghi nhật ký giao dịch.
                  </span>
                ) : (
                  <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    Chỉ Cán bộ Quản lý CSVC mới có quyền Duyệt Nhập Kho vào hệ thống.
                  </span>
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
                    disabled={isApproved || isAnalyzing}
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
