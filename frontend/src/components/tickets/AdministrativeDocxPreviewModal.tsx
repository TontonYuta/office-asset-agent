import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle, FileText } from 'lucide-react';
import { MaintenanceTicket, URGENCY_LABELS } from '../../types/ticket';
import { formatDateVN, formatVND } from '../../lib/formatters';
import { useAuth } from '../../hooks/useAuth';
import { BASE_URL } from '../../services/api';

interface AdministrativeDocxPreviewModalProps {
  ticket: MaintenanceTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (ticketId: string) => void;
}

export function AdministrativeDocxPreviewModal({
  ticket,
  isOpen,
  onClose,
  onApprove,
}: AdministrativeDocxPreviewModalProps) {
  const { profile, isAdmin } = useAuth();
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !ticket) return null;

  const dateObj = new Date(ticket.createdAt);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = () => {
    // Tải file .docx thật chuẩn Nghị định 30 từ backend Python
    try {
      const docxUrl = `${BASE_URL}/tickets/${ticket.id}/docx`;
      window.open(docxUrl, '_blank');
    } catch {
      const docContent = `
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập – Tự do – Hạnh phúc
---
TỔNG CÔNG TY CÔNG NGHỆ & DOANH NGHIỆP
PHÒNG HÀNH CHÍNH – QUẢN TRỊ CSVC
Số: ${ticket.officialDocNumber}

Hà Nội, ngày ${day} tháng ${month} năm ${year}

PHIẾU BÁO HỎNG VÀ ĐỀ NGHỊ BẢO TRÌ THIẾT BỊ VĂN PHÒNG
Kính gửi: Phòng Hành chính – Quản trị Cơ sở vật chất

1. Tên thiết bị: ${ticket.assetName}
2. Mã quản lý: ${ticket.assetId} - Model: ${ticket.assetModel}
3. Vị trí đặt máy: ${ticket.location}
4. Đơn vị sử dụng: ${ticket.department}
5. Người phát hiện / Báo hỏng: ${ticket.reporterName} (${ticket.reporterRole})

I. MÔ TẢ HIỆN TRẠNG HƯ HỎNG:
${ticket.symptomDescription}

II. CHẨN ĐOÁN KỸ THUẬT SƠ BỘ:
${ticket.preliminaryDiagnosis}

III. PHƯƠNG ÁN XỬ LÝ & DỰ TOÁN KINH PHÍ:
- Biện pháp đề xuất: ${ticket.proposedAction}
- Mức độ ưu tiên: ${URGENCY_LABELS[ticket.urgency]}
- Dự toán kinh phí: ${formatVND(ticket.estimatedCost, false)}
${ticket.conversationSummary ? `\nNhật ký đối thoại kỹ thuật:\n${ticket.conversationSummary}` : ''}

NGƯỜI BÁO HỎNG               CÁN BỘ CSVC                LÃNH ĐẠO DUYỆT
(Ký, ghi rõ họ tên)       (Ký, ghi rõ họ tên)         (Ký, đóng dấu)
      `;

      const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Phieu_Bao_Hong_${ticket.id}_ND30.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Văn Bản Hành Chính Chuẩn Nghị Định 30/2020/NĐ-CP
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              [Số: {ticket.officialDocNumber}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span>In Bản A4</span>
            </button>

            <button
              onClick={handleDownloadDocx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Tải File .doc</span>
            </button>

            {isAdmin && ticket.status === 'PENDING_APPROVAL' && onApprove && (
              <button
                onClick={() => {
                  onApprove(ticket.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Phê Duyệt Sửa Chữa</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Khổ giấy A4 hiển thị chuẩn xác */}
        <div className="p-8 bg-zinc-100 dark:bg-zinc-950/70 overflow-y-auto max-h-[75vh] flex justify-center print:p-0 print:bg-white print:max-h-none">
          <div
            ref={printContentRef}
            className="w-full max-w-[800px] bg-white text-zinc-900 p-12 shadow-sm border border-zinc-200 rounded-sm font-serif leading-relaxed text-[13px] print:border-none print:shadow-none print:w-full print:p-6"
          >
            {/* Tiêu ngữ 2 cột chuẩn Nghị định 30/2020 */}
            <div className="grid grid-cols-12 gap-4 pb-6">
              {/* Cột trái: Cơ quan ban hành */}
              <div className="col-span-5 text-center">
                <div className="font-bold uppercase text-[12px] tracking-tight">
                  TỔNG CÔNG TY CÔNG NGHỆ & TM
                </div>
                <div className="font-bold uppercase text-[12px] underline underline-offset-4 tracking-tight">
                  PHÒNG HÀNH CHÍNH – CSVC
                </div>
                <div className="text-[12px] mt-2 font-sans font-normal text-zinc-700">
                  Số: <span className="font-semibold">{ticket.officialDocNumber}</span>
                </div>
              </div>

              {/* Cột phải: Quốc hiệu & Tiêu ngữ */}
              <div className="col-span-7 text-center">
                <div className="font-bold uppercase text-[12px] tracking-wide">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="font-bold text-[13px]">
                  Độc lập – Tự do – Hạnh phúc
                </div>
                <div className="w-32 h-[1px] bg-zinc-900 mx-auto mt-1 mb-2"></div>
                <div className="italic text-[12px] font-sans text-zinc-600">
                  Hà Nội, ngày {day} tháng {month} năm {year}
                </div>
              </div>
            </div>

            {/* Tiêu đề văn bản */}
            <div className="text-center my-6 space-y-1">
              <h2 className="text-base font-bold uppercase tracking-wide">
                PHIẾU BÁO HỎNG VÀ ĐỀ NGHỊ BẢO TRÌ THIẾT BỊ VĂN PHÒNG
              </h2>
              <p className="text-[12px] italic font-sans text-zinc-600">
                (Kèm theo Quy chế Quản lý & Sử dụng Cơ sở vật chất nội bộ)
              </p>
            </div>

            {/* Kính gửi */}
            <div className="mb-6 text-[13px] font-sans">
              <div className="font-medium">
                <span className="italic">Kính gửi:</span>
              </div>
              <ul className="list-disc list-inside ml-4 text-zinc-800 space-y-0.5">
                <li>Ban Giám đốc Tổng Công ty;</li>
                <li>Phòng Hành chính – Quản trị Cơ sở vật chất.</li>
              </ul>
            </div>

            {/* Mục I */}
            <div className="space-y-3 font-sans text-[13px]">
              <div className="font-bold text-zinc-900 uppercase text-[12px] border-b border-zinc-200 pb-1">
                I. THÔNG TIN THIẾT BỊ VÀ ĐƠN VỊ ĐỀ NGHỊ
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-zinc-600">Tên thiết bị hư hỏng:</span>{' '}
                  <span className="font-semibold text-zinc-900">{ticket.assetName}</span>
                </div>
                <div>
                  <span className="text-zinc-600">Mã quản lý kho:</span>{' '}
                  <span className="font-semibold">{ticket.assetId}</span>
                </div>
                <div>
                  <span className="text-zinc-600">Chủng loại / Model:</span>{' '}
                  <span>{ticket.assetModel}</span>
                </div>
                <div>
                  <span className="text-zinc-600">Vị trí lắp đặt:</span>{' '}
                  <span>{ticket.location}</span>
                </div>
                <div>
                  <span className="text-zinc-600">Đơn vị sử dụng:</span>{' '}
                  <span className="font-medium">{ticket.department}</span>
                </div>
                <div>
                  <span className="text-zinc-600">Cán bộ lập phiếu:</span>{' '}
                  <span>{ticket.reporterName} ({ticket.reporterRole})</span>
                </div>
              </div>
            </div>

            {/* Mục II */}
            <div className="space-y-2 font-sans text-[13px] mt-6">
              <div className="font-bold text-zinc-900 uppercase text-[12px] border-b border-zinc-200 pb-1">
                II. HIỆN TRẠNG SỰ CỐ & CHẨN ĐOÁN KỸ THUẬT SƠ BỘ
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-zinc-800">
                <div className="font-medium text-[12px] text-zinc-600 mb-1">
                  Triệu chứng ghi nhận thực tế:
                </div>
                <div className="leading-relaxed">{ticket.symptomDescription}</div>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-zinc-800">
                <div className="font-medium text-[12px] text-zinc-600 mb-1">
                  Chẩn đoán nguyên nhân sơ bộ:
                </div>
                <div className="leading-relaxed">{ticket.preliminaryDiagnosis}</div>
              </div>
            </div>

            {/* Mục III */}
            <div className="space-y-3 font-sans text-[13px] mt-6">
              <div className="font-bold text-zinc-900 uppercase text-[12px] border-b border-zinc-200 pb-1">
                III. PHƯƠNG ÁN KHẮC PHỤC & DỰ TOÁN KINH PHÍ ĐỀ XUẤT
              </div>
              <table className="w-full border-collapse border border-zinc-300 text-[12px]">
                <thead>
                  <tr className="bg-zinc-100 font-semibold text-center">
                    <th className="border border-zinc-300 py-2 px-3">Nội Dung Đề Xuất Xử Lý</th>
                    <th className="border border-zinc-300 py-2 px-3 w-32">Mức Độ Ưu Tiên</th>
                    <th className="border border-zinc-300 py-2 px-3 text-right w-40">Dự Toán Kinh Phí</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-zinc-300 py-2.5 px-3">
                      {ticket.proposedAction}
                    </td>
                    <td className="border border-zinc-300 py-2.5 px-3 text-center font-medium">
                      {URGENCY_LABELS[ticket.urgency]}
                    </td>
                    <td className="border border-zinc-300 py-2.5 px-3 text-right font-bold">
                      {formatVND(ticket.estimatedCost, false)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mục IV: 3 Cột chữ ký */}
            <div className="grid grid-cols-3 gap-4 pt-12 mt-8 text-center font-sans text-[12px]">
              <div>
                <div className="font-bold uppercase">NGƯỜI BÁO HỎNG</div>
                <div className="text-[11px] italic text-zinc-500">(Ký, ghi rõ họ tên)</div>
                <div className="h-20 flex items-end justify-center">
                  <div className="font-semibold text-zinc-900">{ticket.reporterName}</div>
                </div>
              </div>

              <div>
                <div className="font-bold uppercase">CÁN BỘ PHỤ TRÁCH CSVC</div>
                <div className="text-[11px] italic text-zinc-500">(Ký, ghi rõ họ tên)</div>
                <div className="h-20 flex items-end justify-center">
                  <div className="font-semibold text-zinc-900">
                    {ticket.approvedBy || (isAdmin ? profile.name : 'Trần Huy Hoàng')}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-bold uppercase">LÃNH ĐẠO DUYỆT</div>
                <div className="text-[11px] italic text-zinc-500">(Ký, đóng dấu)</div>
                <div className="h-20 flex items-end justify-center">
                  <div className="italic text-zinc-400">
                    {ticket.status === 'APPROVED' || ticket.status === 'RESOLVED'
                      ? 'Đã duyệt ký điện tử'
                      : '(Chờ phê duyệt)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chân modal */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex items-center justify-between print:hidden">
          <span>Tiêu chuẩn trình bày: Phụ lục I - Nghị định số 30/2020/NĐ-CP của Chính phủ</span>
          <span>Khổ giấy in tiêu chuẩn: A4 (210 x 297 mm)</span>
        </div>
      </div>
    </div>
  );
}
