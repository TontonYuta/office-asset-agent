import React, { useState } from 'react';
import { X, Wrench, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTickets } from '../../hooks/useTickets';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { TicketUrgency, URGENCY_LABELS } from '../../types/ticket';
import { formatVND } from '../../lib/formatters';

interface TicketEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillData?: {
    assetId: string;
    assetName: string;
    assetModel: string;
    symptom: string;
    preliminaryDiagnosis: string;
    proposedAction: string;
    conversationSummary: string;
  };
  onSuccessNavigate?: () => void;
}

export function TicketEscalationModal({
  isOpen,
  onClose,
  prefillData,
  onSuccessNavigate,
}: TicketEscalationModalProps) {
  const { createTicket } = useTickets();
  const { assets } = useInventory();
  const { profile } = useAuth();

  const [assetId, setAssetId] = useState<string>(prefillData?.assetId || 'TB-201');
  const [symptom, setSymptom] = useState<string>(
    prefillData?.symptom || 'Máy in kéo giấy bị kẹt liên tục tại khay cuốn'
  );
  const [diagnosis, setDiagnosis] = useState<string>(
    prefillData?.preliminaryDiagnosis || 'Trục cao su cuốn giấy bị mòn hoặc bao lụa sấy rách'
  );
  const [proposedAction, setProposedAction] = useState<string>(
    prefillData?.proposedAction || 'Vệ sinh trục kéo hoặc thay thế cụm cao su cuốn giấy mới'
  );
  const [estimatedCost, setEstimatedCost] = useState<number>(350000);
  const [urgency, setUrgency] = useState<TicketUrgency>('HIGH');
  const [location, setLocation] = useState<string>('Phòng Marketing - Tầng 3 (Bàn in chung)');
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAsset = assets.find((a) => a.id === assetId) || assets[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTkt = createTicket({
      assetId: currentAsset?.id || 'TB-201',
      assetName: currentAsset?.name || 'Máy in Laser Canon LBP 2900',
      assetModel: currentAsset?.model || 'Canon LBP 2900',
      department: profile.department,
      reporterName: profile.name,
      reporterRole: profile.title,
      location,
      symptomDescription: symptom,
      preliminaryDiagnosis: diagnosis,
      proposedAction,
      estimatedCost,
      urgency,
      conversationSummary: prefillData?.conversationSummary || 'Người dùng đã thử rút giấy kẹt nhưng sự cố vẫn tiếp diễn.',
    });

    setCreatedTicketId(newTkt.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Lập Phiếu Báo Hỏng Trình Cán Bộ Quản Trị CSVC
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {createdTicketId ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Phiếu Báo Hỏng Đã Được Tạo Thành Công!
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Mã văn bản: <strong className="text-zinc-900 dark:text-zinc-100">{createdTicketId}</strong>.
                Phiếu đã được số hóa theo đúng thể thức Nghị định 30/2020 và chuyển đến Cán bộ CSVC phê duyệt.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Đóng
              </button>
              {onSuccessNavigate && (
                <button
                  onClick={() => {
                    onClose();
                    onSuccessNavigate();
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  <span>Xem Phiếu Báo Hỏng A4</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
            <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Hệ thống đã tự động lấy thông tin thiết bị và chẩn đoán từ cuộc trao đổi của đồng chí.
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Thiết bị gặp sự cố
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-800 dark:text-zinc-200"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.id}] {a.name} ({a.model})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Đơn vị báo hỏng
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.department}
                  className="w-full px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Mức độ khẩn cấp
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as TicketUrgency)}
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-800 dark:text-zinc-200"
                >
                  <option value="NORMAL">Bình thường</option>
                  <option value="HIGH">Ưu tiên cao</option>
                  <option value="CRITICAL">Khẩn cấp (Cần ngay)</option>
                  <option value="LOW">Thấp (Có máy dự phòng)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Mô tả hiện trạng sự cố *
              </label>
              <textarea
                rows={2}
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md resize-none text-zinc-800 dark:text-zinc-200"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Chẩn đoán nguyên nhân sơ bộ
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-800 dark:text-zinc-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Đề xuất biện pháp xử lý
                </label>
                <input
                  type="text"
                  value={proposedAction}
                  onChange={(e) => setProposedAction(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-800 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Dự toán kinh phí (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-800 dark:text-zinc-200 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xs"
              >
                Gửi Phiếu Trình Duyệt Ngay
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
