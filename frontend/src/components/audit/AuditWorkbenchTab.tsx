import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Info,
  Shield,
  Layers,
  ArrowRight,
  PackageCheck,
  Send,
  Lock,
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { evaluateAIMRM, rankEpisodesBySimilarity } from '../../lib/math';
import { INITIAL_EPISODES } from '../../services/api';

interface AuditWorkbenchTabProps {
  initialAssetId?: string | null;
}

const DEPARTMENTS = [
  'Phòng Truyền thông & Tiếp thị',
  'Phòng Kế toán - Tài chính',
  'Phòng Hành chính – Quản trị CSVC',
  'Phòng Công nghệ & Phần mềm',
  'Ban Giám Đốc',
  'Phòng Nhân sự & Đào tạo',
];

export function AuditWorkbenchTab({ initialAssetId }: AuditWorkbenchTabProps) {
  const { assets, adjustStock } = useInventory();
  const { profile, isAdmin, openLoginModal } = useAuth();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAssetId || (assets[0]?.id ?? 'VT-GIAY-A4')
  );
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [requestedQty, setRequestedQty] = useState<number>(25);
  const [purpose, setPurpose] = useState<string>('Cấp phát phục vụ in tài liệu hội nghị & đào tạo nội bộ');
  const [requesterName, setRequesterName] = useState<string>(profile.name);

  // Approval notification state
  const [approvalResult, setApprovalResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // Deterministic business evaluation
  const evaluation = useMemo(() => {
    if (!selectedAsset) return null;
    return evaluateAIMRM(selectedAsset, requestedQty);
  }, [selectedAsset, requestedQty]);

  // Ranked closest historical episodes
  const pastRecords = useMemo(() => {
    if (!selectedAsset) return [];
    return rankEpisodesBySimilarity(INITIAL_EPISODES, selectedAsset.id, requestedQty);
  }, [selectedAsset, requestedQty]);

  // Action: Phê duyệt xuất kho thực tế (Chỉ Quản lý)
  const handleApprove = (qtyToApprove: number, isAdjusted: boolean = false) => {
    if (!isAdmin) {
      setApprovalResult({
        success: false,
        message: 'Từ chối: Thao tác xuất kho bắt buộc quyền Cán bộ Quản trị CSVC.',
      });
      return;
    }
    if (!selectedAsset) return;

    if (qtyToApprove > selectedAsset.currentStock) {
      setApprovalResult({
        success: false,
        message: `Kho hiện chỉ còn ${selectedAsset.currentStock} ${selectedAsset.unit}, không đủ để xuất ${qtyToApprove} ${selectedAsset.unit}!`,
      });
      return;
    }

    const note = isAdjusted
      ? `[Duyệt điều chỉnh định mức: ${qtyToApprove}/${requestedQty} ${selectedAsset.unit}] Cấp cho ${department} (${purpose})`
      : `[Duyệt cấp phát định mức: ${qtyToApprove} ${selectedAsset.unit}] Cấp cho ${department} (${purpose})`;

    const res = adjustStock(
      selectedAsset.id,
      'OUT',
      qtyToApprove,
      note,
      `${profile.name} (${profile.title})`,
      `CP-${Date.now().toString().slice(-4)}`
    );

    if (res.success) {
      setApprovalResult({
        success: true,
        message: `Đã phê duyệt xuất kho thành công ${qtyToApprove} ${selectedAsset.unit} cho ${department}. Số lượng kho đã được tự động trừ!`,
      });
      setTimeout(() => setApprovalResult(null), 4500);
    } else {
      setApprovalResult({
        success: false,
        message: res.message,
      });
    }
  };

  // Action: Gửi đề xuất (Dành cho Nhân viên)
  const handleSubmitProposal = () => {
    setApprovalResult({
      success: true,
      message: `Đã gửi đề xuất xin cấp ${requestedQty} ${selectedAsset?.unit} của ${department} đến Ban Quản lý CSVC để thẩm định và phê duyệt!`,
    });
    setTimeout(() => setApprovalResult(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Rõ ràng vai trò & nghiệp vụ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isAdmin
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {isAdmin ? 'Quản Lý CSVC: Bàn Phê Duyệt Cấp Phát' : 'Nhân Viên: Đề Xuất Xin Cấp Vật Tư'}
            </span>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {isAdmin ? 'Thẩm Định Định Mức & Phê Duyệt Xuất Kho' : 'Gửi Đề Xuất Cấp Phát Định Mức Cho Phòng Ban'}
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
            {isAdmin
              ? 'Hệ thống tự động đối chiếu lượng xin cấp với mức tiêu thụ bình thường và lượng hàng dự phòng của kho để đưa ra quyết định xuất kho tối ưu nhất.'
              : 'Chọn vật tư và số lượng phòng ban bạn cần sử dụng. Đề xuất sẽ được gửi đến Cán bộ Quản trị CSVC để thẩm định và duyệt xuất kho.'}
          </p>
        </div>

        {/* Vai trò hiện tại */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right text-xs">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{profile.name}</div>
            <div className="text-[11px] text-zinc-500">{profile.roleLabel} · {profile.department}</div>
          </div>
          {!isAdmin && (
            <button
              onClick={openLoginModal}
              title="Đăng nhập tài khoản Quản lý để có quyền duyệt xuất kho"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Đăng nhập Quản lý</span>
            </button>
          )}
        </div>
      </div>

      {/* Thông báo kết quả thao tác */}
      {approvalResult && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between animate-in fade-in ${
            approvalResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {approvalResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span className="font-semibold">{approvalResult.message}</span>
          </div>
        </div>
      )}

      {/* Banner cảnh báo quyền hạn nếu là Nhân viên */}
      {!isAdmin && (
        <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-950 dark:text-amber-100">
              Chế độ Nhân viên: Quyền gửi đề xuất (Chỉ xem định mức)
            </div>
            <div className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-300">
              Bạn có thể gửi đề xuất xin vật tư cho phòng ban của mình. Quyết định duyệt xuất kho và điều chỉnh số lượng thuộc về Cán bộ Quản trị CSVC.
            </div>
          </div>
        </div>
      )}

      {/* 2 Cột làm việc chính */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Đơn đề xuất cấp phát */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              1. Thông Tin Phiếu Đề Xuất
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              Mã: DP-{Date.now().toString().slice(-4)}
            </span>
          </div>

          {/* Chọn phòng ban */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Đơn vị / Phòng ban xin cấp
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-hidden text-zinc-800 dark:text-zinc-200"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn vật tư */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Loại vật tư cần cấp
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-hidden text-zinc-800 dark:text-zinc-200"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.id}] {a.name} (Tồn kho: {a.currentStock} {a.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Xem nhanh hiện trạng kho */}
          {selectedAsset && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Số lượng đang có trong kho:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {selectedAsset.currentStock} {selectedAsset.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Mức dự phòng tối thiểu cần giữ:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {evaluation?.safeStock ?? selectedAsset.minSafeStock} {selectedAsset.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Mức sử dụng thông thường:</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  ~{selectedAsset.meanMonthlyDemand} {selectedAsset.unit} / tháng
                </span>
              </div>
            </div>
          )}

          {/* Số lượng xin cấp */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Số lượng đề xuất cấp ({selectedAsset?.unit || 'Đơn vị'})
              </label>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {requestedQty} {selectedAsset?.unit}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={Math.max(60, (selectedAsset?.currentStock || 10) * 1.5)}
                value={requestedQty}
                onChange={(e) => setRequestedQty(parseInt(e.target.value) || 1)}
                className="flex-1 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
              />
              <input
                type="number"
                min={1}
                value={requestedQty}
                onChange={(e) => setRequestedQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 text-xs text-right bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-hidden text-zinc-900 dark:text-zinc-100 font-bold"
              />
            </div>
          </div>

          {/* Mục đích sử dụng */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Mục đích sử dụng & lý do đề xuất
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-hidden text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Cán bộ đề xuất
            </label>
            <input
              type="text"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-hidden text-zinc-800 dark:text-zinc-200"
            />
          </div>
        </div>

        {/* Cột phải: Thẩm định & Quyết định phê duyệt */}
        <div className="lg:col-span-7 space-y-4">
          {evaluation && selectedAsset && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  2. Kết Quả Thẩm Định & Khuyến Nghị
                </h3>
                <span className="text-[11px] text-zinc-500">
                  Tự động đối chiếu tồn kho thực tế
                </span>
              </div>

              {/* Thẻ Quyết Định Nghiệp Vụ Thực Tế */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  evaluation.status === 'RECOMMENDED_APPROVAL'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                    : evaluation.status === 'EXCEEDED_NORM_WARNING'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                    : 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {evaluation.status === 'RECOMMENDED_APPROVAL' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {evaluation.status === 'EXCEEDED_NORM_WARNING' && (
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    )}
                    {evaluation.status === 'REJECTED_OUT_OF_STOCK' && (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-bold tracking-tight">
                        {evaluation.status === 'RECOMMENDED_APPROVAL' && 'ĐỀ XUẤT: PHÊ DUYỆT ĐỦ SỐ LƯỢNG'}
                        {evaluation.status === 'EXCEEDED_NORM_WARNING' &&
                          (evaluation.isAnomaly
                            ? 'CẢNH BÁO: SỐ LƯỢNG CAO HƠN BÌNH THƯỜNG'
                            : 'CẢNH BÁO: TỒN KHO XUỐNG DƯỚI MỨC DỰ PHÒNG')}
                        {evaluation.status === 'REJECTED_OUT_OF_STOCK' && 'TỪ CHỐI: KHO KHÔNG ĐỦ HÀNG'}
                      </div>
                      <div className="text-xs opacity-90 mt-1 leading-relaxed">
                        {evaluation.status === 'RECOMMENDED_APPROVAL' &&
                          `Số lượng xin cấp (${requestedQty} ${selectedAsset.unit}) nằm trong định mức hợp lý. Kho sau khi xuất vẫn còn ${evaluation.projectedStock} ${selectedAsset.unit}, hoàn toàn đảm bảo mức dự phòng.`}
                        {evaluation.status === 'EXCEEDED_NORM_WARNING' &&
                          (evaluation.isAnomaly
                            ? `Phòng ban này bình thường chỉ dùng khoảng ${selectedAsset.meanMonthlyDemand} ${selectedAsset.unit}/tháng. Đợt này xin ${requestedQty} ${selectedAsset.unit} là cao đột biến. Hệ thống khuyến nghị điều chỉnh cấp ${evaluation.safeStock + 10} ${selectedAsset.unit}.`
                            : `Nếu cấp đủ ${requestedQty} ${selectedAsset.unit}, kho chỉ còn ${evaluation.projectedStock} ${selectedAsset.unit} (dưới mức dự phòng an toàn ${evaluation.safeStock} ${selectedAsset.unit}). Đề xuất điều chỉnh giảm.`)}
                        {evaluation.status === 'REJECTED_OUT_OF_STOCK' &&
                          `Kho hiện chỉ còn ${selectedAsset.currentStock} ${selectedAsset.unit}, không đủ để cấp ${requestedQty} ${selectedAsset.unit}.`}
                      </div>
                    </div>
                  </div>

                  {evaluation.isAnomaly && (
                    <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[10px] font-bold shrink-0 border border-amber-300 dark:border-amber-700">
                      Vượt mức thường lệ
                    </span>
                  )}
                </div>

                {/* Các nút hành động nghiệp vụ thực tế */}
                <div className="mt-4 pt-3 border-t border-current/15 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs opacity-90">
                    {isAdmin ? (
                      <span className="font-medium">
                        Quyền Quản lý CSVC: Nhấn nút để xuất kho và tự động ghi sổ giao dịch.
                      </span>
                    ) : (
                      <span className="italic">
                        Chế độ Nhân viên: Nhấn nút để gửi phiếu trình Quản lý phê duyệt.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <>
                        {/* Nút duyệt theo lượng khuyến nghị nếu bị vượt mức */}
                        {evaluation.status === 'EXCEEDED_NORM_WARNING' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(Math.min(requestedQty, evaluation.safeStock + 10), true)}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs"
                          >
                            Duyệt Điều Chỉnh ({Math.min(requestedQty, evaluation.safeStock + 10)} {selectedAsset.unit})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleApprove(requestedQty, false)}
                          disabled={evaluation.isNegativeStock}
                          className="px-4 py-1.5 text-xs font-semibold rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                        >
                          Duyệt Đủ Số Lượng ({requestedQty})
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitProposal}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi Đề Xuất Trình Duyệt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Thẻ Chỉ Số Nghiệp Vụ Thực Tế (Không Math Slop) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                  <div className="text-[11px] text-zinc-500 font-medium">Mức Dự Phòng Của Kho</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {evaluation.safeStock} {selectedAsset.unit}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">Đủ phòng ngừa chậm giao hàng</div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                  <div className="text-[11px] text-zinc-500 font-medium">Đánh Giá Nhu Cầu</div>
                  <div
                    className={`text-sm font-bold mt-1.5 ${
                      evaluation.isAnomaly ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {evaluation.isAnomaly ? 'Tăng đột biến (> 2 lần)' : 'Nằm trong định mức'}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Bình quân: ~{selectedAsset.meanMonthlyDemand} {selectedAsset.unit}/tháng
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                  <div className="text-[11px] text-zinc-500 font-medium">Tồn Kho Dự Kiến Còn Lại</div>
                  <div
                    className={`text-lg font-bold mt-0.5 ${
                      evaluation.projectedStock < 0
                        ? 'text-red-600 dark:text-red-400'
                        : evaluation.projectedStock < evaluation.safeStock
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {evaluation.projectedStock} {selectedAsset.unit}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Hiện có {selectedAsset.currentStock} − Xuất {requestedQty}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lịch sử cấp phát các lần trước của phòng ban này */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Lịch Sử Cấp Phát Thực Tế Các Tháng Trước
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Căn cứ tham chiếu các lần cấp phát trước của {department}
                </p>
              </div>
              <span className="text-xs text-zinc-500 font-medium">3 đợt gần nhất</span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {pastRecords.map((ep) => (
                <div key={ep.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span>{ep.department}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {ep.date}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{ep.note}</div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      Đã cấp: {ep.pastQuantity} {selectedAsset?.unit}
                    </span>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {ep.outcome === 'FULFILLED' ? 'Cấp đủ theo phiếu' : 'Đã điều chỉnh định mức'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
