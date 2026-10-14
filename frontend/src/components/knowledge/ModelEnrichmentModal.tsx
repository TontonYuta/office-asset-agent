import React, { useState } from 'react';
import { X, Globe, Cpu, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ModelEnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrichSuccess: (newDevice: {
    id: string;
    model: string;
    name: string;
    category: string;
    operatingSteps: { step: number; title: string; description: string }[];
    errorCodes: { code: string; title: string; symptom: string; fix: string }[];
  }) => void;
}

export function ModelEnrichmentModal({ isOpen, onClose, onEnrichSuccess }: ModelEnrichmentModalProps) {
  const [modelName, setModelName] = useState('Canon imageRUNNER 2006N');
  const [manufacturerUrl, setManufacturerUrl] = useState('https://vn.canon/vi/support/imageRUNNER-2006N');
  const [isCrawling, setIsCrawling] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    'Kết nối tài liệu hướng dẫn kỹ thuật chính hãng...',
    'Đang đọc thông số phần cứng, chu kỳ bảo dưỡng và khay giấy...',
    'Đang trích xuất bảng mã lỗi và hướng dẫn tự xử lý tại chỗ...',
    'Đang lưu thông tin vào sổ tay kỹ thuật và cập nhật cho trợ lý...',
  ];

  const handleStartEnrichment = () => {
    if (!modelName.trim()) return;
    setIsCrawling(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsCrawling(false);
            onEnrichSuccess({
              id: `TB-MOI-${Date.now().toString().slice(-3)}`,
              model: modelName,
              name: `Máy photocopy đa năng ${modelName}`,
              category: 'Thiết bị dùng chung',
              operatingSteps: [
                {
                  step: 1,
                  title: 'Bật nguồn & Nạp giấy',
                  description: 'Bật công tắc nguồn bên hông máy, chờ máy khởi động làm nóng sấy trong 15 giây. Kéo khay giấy số 1 và nạp giấy A4 căn thẳng hai bên.',
                },
                {
                  step: 2,
                  title: 'Chọn chế độ & Số lượng bản chụp',
                  description: 'Đặt tài liệu gốc úp mặt kính hoặc nạp khay tự động trên nóc máy, chọn số lượng bản sao trên màn hình cảm ứng.',
                },
                {
                  step: 3,
                  title: 'Lấy tài liệu & Đưa máy về chế độ chờ',
                  description: 'Nhận tài liệu tại khay thoát, kiểm tra bản in sắc nét và nhấn phím Tiết kiệm điện để đưa máy về trạng thái chờ.',
                },
              ],
              errorCodes: [
                {
                  code: 'E000',
                  title: 'Nhiệt độ bộ phận sấy chưa đạt chuẩn',
                  symptom: 'Màn hình máy báo lỗi E000, đèn nháy đỏ, máy không in được.',
                  fix: 'Rút phích cắm điện, chờ 5 phút cho nguội rồi cắm lại chắc chắn. Nếu vẫn báo lỗi, liên hệ Cán bộ CSVC kiểm tra thanh nhiệt sấy.',
                },
                {
                  code: 'E020',
                  title: 'Cảm biến nồng độ mực báo hết',
                  symptom: 'Máy phát tiếng kêu tít dài, không nhận hộp mực mới thay.',
                  fix: 'Mở nắp khoang mực, xoay chốt khóa theo chiều kim đồng hồ, dùng khăn khô mềm lau sạch mắt đọc cảm biến bên trong.',
                },
                {
                  code: 'KET-01',
                  title: 'Kẹt giấy khay nạp tự động',
                  symptom: 'Giấy bị giữ lại giữa đường dẫn khay tự động.',
                  fix: 'Gạt lẫy màu xanh lá theo chiều mũi tên, rút giấy theo chiều thuận trục cuốn, tránh giật mạnh làm rách mẩu giấy bên trong.',
                },
              ],
            });
            onClose();
          }, 800);
          return prev;
        }
      });
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Bổ Sung Thiết Bị Mới Vào Sổ Tay Kỹ Thuật
            </h3>
          </div>
          {!isCrawling && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Hệ thống tự động tra cứu hướng dẫn sử dụng, cách vận hành 3 bước và bảng mã lỗi từ nhà sản xuất để nạp vào sổ tay cho mọi nhân viên cùng xem.
          </p>

          {!isCrawling ? (
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Tên model máy cần bổ sung *
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="VD: Canon imageRUNNER 2006N, Ricoh MP 2014D..."
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Đường dẫn tài liệu hãng (tùy chọn)
                </label>
                <input
                  type="url"
                  value={manufacturerUrl}
                  onChange={(e) => setManufacturerUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 text-[11px]"
                />
              </div>

              <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 space-y-1">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px]">
                  Các bước hệ thống sẽ tự động thực hiện:
                </div>
                <div className="text-[11px]">
                  1. Đọc tài liệu sử dụng chính hãng từ nhà sản xuất.
                </div>
                <div className="text-[11px]">
                  2. Tóm tắt quy trình 3 bước sử dụng đơn giản cho nhân viên.
                </div>
                <div className="text-[11px]">
                  3. Tổng hợp bảng mã lỗi thường gặp và cách tự khắc phục tại chỗ.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleStartEnrichment}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bắt Đầu Bổ Sung Thiết Bị</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-zinc-900 dark:text-zinc-100 animate-spin" />
              </div>

              <div className="text-center">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {steps[currentStep]}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Đang xử lý dữ liệu cho: <strong className="text-zinc-700 dark:text-zinc-300">{modelName}</strong>
                </div>
              </div>

              <div className="space-y-1.5 px-4 pt-2">
                {steps.map((s, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-[11px] transition-colors ${
                      idx < currentStep
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : idx === currentStep
                        ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                        : 'text-zinc-400'
                    }`}
                  >
                    {idx < currentStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : idx === currentStep ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                    )}
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
