import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Plus,
  Eye,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { MaintenanceTicket, TicketStatus, TicketUrgency, URGENCY_LABELS, STATUS_LABELS } from '../../types/ticket';
import { useTickets } from '../../hooks/useTickets';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { formatVND, formatDateVN } from '../../lib/formatters';
import { AdministrativeDocxPreviewModal } from './AdministrativeDocxPreviewModal';

export function TicketsTab() {
  const { tickets, updateTicketStatus, createTicket } = useTickets();
  const { assets } = useInventory();
  const { profile, isAdmin } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'DEPT'>(isAdmin ? 'ALL' : 'DEPT');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Ticket Form State
  const [newAssetId, setNewAssetId] = useState<string>(assets[0]?.id || 'TB-201');
  const [newDepartment, setNewDepartment] = useState<string>(profile.department);
  const [newSymptom, setNewSymptom] = useState<string>('');
  const [newDiagnosis, setNewDiagnosis] = useState<string>('');
  const [newAction, setNewAction] = useState<string>('');
  const [newCost, setNewCost] = useState<number>(250000);
  const [newUrgency, setNewUrgency] = useState<TicketUrgency>('HIGH');
  const [newLocation, setNewLocation] = useState<string>('Văn phòng Marketing - Tầng 3');

  const myDeptTicketsCount = tickets.filter(
    (t) =>
      t.department.toLowerCase().includes(profile.department.toLowerCase()) ||
      t.reporterName.toLowerCase() === profile.name.toLowerCase()
  ).length;

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (scopeFilter === 'DEPT') {
      return (
        t.department.toLowerCase().includes(profile.department.toLowerCase()) ||
        t.reporterName.toLowerCase() === profile.name.toLowerCase()
      );
    }
    return true;
  });

  const handleOpenDoc = (ticket: MaintenanceTicket) => {
    setSelectedTicket(ticket);
    setIsDocModalOpen(true);
  };

  const handleApprove = (ticketId: string) => {
    updateTicketStatus(ticketId, 'APPROVED', `${profile.name} (${profile.title})`);
  };

  const handleMarkResolved = (ticketId: string) => {
    updateTicketStatus(ticketId, 'RESOLVED');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === newAssetId);
    if (!asset) return;

    createTicket({
      assetId: asset.id,
      assetName: asset.name,
      assetModel: asset.model,
      department: newDepartment,
      reporterName: profile.name,
      reporterRole: profile.title,
      location: newLocation,
      symptomDescription: newSymptom,
      preliminaryDiagnosis: newDiagnosis || 'Chẩn đoán sơ bộ từ tác tử kỹ thuật CSVC',
      proposedAction: newAction || 'Kiểm tra kỹ thuật và thay thế linh kiện hao mòn',
      estimatedCost: newCost,
      urgency: newUrgency,
    });

    setIsCreateModalOpen(false);
    setNewSymptom('');
    setNewDiagnosis('');
    setNewAction('');
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {STATUS_LABELS.PENDING_APPROVAL}
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {STATUS_LABELS.APPROVED}
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {STATUS_LABELS.IN_PROGRESS}
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {STATUS_LABELS.RESOLVED}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {STATUS_LABELS.REJECTED}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isAdmin
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {isAdmin ? 'Quản Lý CSVC: Tiếp Nhận & Duyệt Phương Án' : 'Nhân Viên: Báo Hỏng & Theo Dõi Tiến Độ'}
            </span>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {isAdmin
                ? 'Thẩm Định Sự Cố & Phê Duyệt Sửa Chữa Thiết Bị'
                : 'Quản Lý Phiếu Báo Hỏng & Đề Nghị Bảo Trì'}
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl">
            {isAdmin
              ? 'Tiếp nhận phản ánh từ các phòng ban, thẩm định mức độ hư hại và duyệt xuất kinh phí/gọi đơn vị bảo dưỡng theo đúng thẩm quyền.'
              : `Theo dõi tiến độ khắc phục thiết bị tại ${profile.department}. Mọi phiếu được tự động chuẩn hóa văn bản hành chính theo Nghị định 30/2020.`}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Báo Hỏng Mới</span>
        </button>
      </div>

      {/* Thanh chuyển phạm vi phòng ban & Bộ lọc tình trạng */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Chuyển phạm vi: Phòng ban tôi vs Toàn công ty */}
        <div className="flex items-center p-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
          <button
            onClick={() => setScopeFilter('DEPT')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              scopeFilter === 'DEPT'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Phòng Ban Tôi ({myDeptTicketsCount})
          </button>
          <button
            onClick={() => setScopeFilter('ALL')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              scopeFilter === 'ALL'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Toàn Công Ty ({tickets.length})
          </button>
        </div>

        {/* Bộ lọc tình trạng */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { key: 'ALL', label: 'Tất cả trạng thái' },
            { key: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
            { key: 'APPROVED', label: 'Đã duyệt' },
            { key: 'IN_PROGRESS', label: 'Đang sửa' },
            { key: 'RESOLVED', label: 'Đã xong' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap text-xs font-medium ${
                statusFilter === tab.key
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách thẻ phiếu báo hỏng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-500 italic">
            Không có phiếu báo hỏng nào trong danh mục này.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-3">
                {/* Dòng đầu */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {ticket.id}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-[11px] text-zinc-500">
                      Số: {ticket.officialDocNumber}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      ticket.urgency === 'CRITICAL'
                        ? 'border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50'
                        : ticket.urgency === 'HIGH'
                        ? 'border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800'
                    }`}
                  >
                    {URGENCY_LABELS[ticket.urgency]}
                  </span>
                </div>

                {/* Tên thiết bị và Model */}
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {ticket.assetName}
                  </h4>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Mã kho: {ticket.assetId} · {ticket.assetModel}
                  </div>
                </div>

                {/* Hiện trạng */}
                <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                  <strong className="text-zinc-800 dark:text-zinc-200">Hiện trạng:</strong>{' '}
                  {ticket.symptomDescription}
                </div>

                {/* Thông tin phòng ban & chi phí */}
                <div className="text-[11px] space-y-1 text-zinc-500">
                  <div className="flex justify-between">
                    <span>Đơn vị sử dụng:</span>
                    <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]">
                      {ticket.department}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Người lập phiếu:</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {ticket.reporterName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dự toán kinh phí:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatVND(ticket.estimatedCost, !isAdmin)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chân thẻ: Trạng thái & Nút thao tác */}
              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <div>{getStatusBadge(ticket.status)}</div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenDoc(ticket)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Xem Văn Bản A4</span>
                  </button>

                  {isAdmin ? (
                    <>
                      {ticket.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => handleApprove(ticket.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
                        >
                          Duyệt
                        </button>
                      )}

                      {ticket.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleMarkResolved(ticket.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-colors shadow-xs"
                        >
                          Xong
                        </button>
                      )}
                    </>
                  ) : (
                    ticket.status === 'PENDING_APPROVAL' && (
                      <span className="text-[10px] text-zinc-400 italic">
                        Chờ CSVC duyệt
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal tạo phiếu báo hỏng mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Lập Phiếu Báo Hỏng & Đề Nghị Bảo Trì
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Chọn thiết bị gặp sự cố *
                </label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100"
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
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as TicketUrgency)}
                    className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="NORMAL">Bình thường</option>
                    <option value="HIGH">Ưu tiên cao</option>
                    <option value="CRITICAL">Khẩn cấp</option>
                    <option value="LOW">Thấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Vị trí đặt máy
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Mô tả chi tiết sự cố *
                </label>
                <textarea
                  rows={2}
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Mô tả hiện tượng: kẹt giấy, không lên nguồn, rè loa..."
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md resize-none text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Đề xuất hướng xử lý
                </label>
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="VD: Thay thế bao lụa sấy, vệ sinh mắt đọc..."
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Dự toán kinh phí ước tính (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={newCost}
                  onChange={(e) => setNewCost(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-600 dark:text-zinc-400"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md font-semibold"
                >
                  Lập Phiếu Trình Duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem văn bản hành chính A4 chuẩn */}
      <AdministrativeDocxPreviewModal
        ticket={selectedTicket}
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onApprove={handleApprove}
      />
    </div>
  );
}
