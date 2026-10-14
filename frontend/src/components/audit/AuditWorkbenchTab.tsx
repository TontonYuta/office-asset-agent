import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Info,
  HelpCircle,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { evaluateAIMRM, rankEpisodesBySimilarity } from '../../lib/math';
import { INITIAL_EPISODES } from '../../services/api';
import { formatNumber } from '../../lib/formatters';

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
  const { profile, isAdmin } = useAuth();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAssetId || (assets[0]?.id ?? 'VT-101')
  );
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [requestedQty, setRequestedQty] = useState<number>(20);
  const [purpose, setPurpose] = useState<string>('Cấp phát phục vụ hội nghị và đào tạo nội bộ');
  const [requesterName, setRequesterName] = useState<string>(profile.name);

  // Approval notification state
  const [approvalResult, setApprovalResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // Deterministic evaluation
  const aimrmResult = useMemo(() => {
    if (!selectedAsset) return null;
    return evaluateAIMRM(selectedAsset, requestedQty);
  }, [selectedAsset, requestedQty]);

  // Ranked 3 closest records
  const episodes = useMemo(() => {
    if (!selectedAsset) return [];
    return rankEpisodesBySimilarity(INITIAL_EPISODES, selectedAsset.id, requestedQty);
  }, [selectedAsset, requestedQty]);

  const handleDirectApprove = () => {
    if (!isAdmin) {
      setApprovalResult({
        success: false,
        message: 'Chỉ Quản trị viên CSVC mới có quyền duyệt xuất kho trực tiếp.',
      });
      return;
    }
    if (!selectedAsset || !aimrmResult) return;

    if (aimrmResult.isNegativeStock) {
      setApprovalResult({
        success: false,
        message: 'Không thể duyệt cấp phát: Số lượng yêu cầu lớn hơn số hàng đang có trong kho!',
      });
      return;
    }

    const res = adjustStock(
      selectedAsset.id,
      'OUT',
      requestedQty,
      `[Duyệt định mức] Cấp cho ${department} (${purpose})`,
      `${profile.name} (${profile.title})`,
      `CP-${Date.now().toString().slice(-4)}`
    );

    if (res.success) {
      setApprovalResult({
        success: true,
        message: `Đã phê duyệt xuất cấp ${requestedQty} ${selectedAsset.unit} cho ${department}. Kho đã được tự động trừ!`,
      });
      setTimeout(() => setApprovalResult(null), 4000);
    } else {
      setApprovalResult({
        success: false,
        message: res.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner giới thiệu trực quan */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              Thẩm Định Tự Động
            </span>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Thẩm Định Định Mức Cấp Phát & Tồn Kho An Toàn
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
            Hệ thống tự động tính toán nhu cầu thực tế dựa trên công thức xác suất thống kê chuẩn,
            giúp cán bộ duyệt đúng số lượng, tránh lãng phí và bảo đảm kho không bao giờ bị đứt gãy.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 shrink-0 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800">
          <div>
            Độ tin cậy: <span className="font-semibold text-zinc-900 dark:text-zinc-100">95%</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <div>
            Thời gian bù hàng: <span className="font-semibold text-zinc-900 dark:text-zinc-100">1 tuần</span>
          </div>
        </div>
      </div>

      {approvalResult && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
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
            <span className="font-medium">{approvalResult.message}</span>
          </div>
          <button
            onClick={() => setApprovalResult(null)}
            className="text-[11px] underline hover:opacity-80 ml-2"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Giao diện chia đôi trực quan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái: Nhập thông tin phiếu cấp phát (5 phần) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              1. Thông Tin Đề Xuất Cấp Phát
            </h3>
            <span className="text-[11px] text-zinc-500">Mẫu YCCP-2026</span>
          </div>

          {/* Chọn phòng ban */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Đơn vị / Phòng ban xin nhận
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 text-zinc-800 dark:text-zinc-200"
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
              Chọn loại vật tư trong kho
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 text-zinc-800 dark:text-zinc-200"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.id}] {a.name} (Tồn kho: {a.currentStock} {a.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Khối xem nhanh thông số kho */}
          {selectedAsset && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Số lượng đang có trong kho:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedAsset.currentStock} {selectedAsset.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Mức dự phòng an toàn tối thiểu:</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {selectedAsset.minSafeStock} {selectedAsset.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tiêu thụ bình quân hàng tháng (μ):</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {selectedAsset.meanMonthlyDemand} {selectedAsset.unit}/tháng
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Độ biến động nhu cầu (σ):</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  ±{selectedAsset.stdDevDemand} {selectedAsset.unit}
                </span>
              </div>
            </div>
          )}

          {/* Số lượng xin cấp */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Số lượng muốn xin cấp ({selectedAsset?.unit || 'Đơn vị'})
              </label>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
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
                className="w-16 px-2 py-1 text-xs text-right bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none text-zinc-900 dark:text-zinc-100 font-semibold"
              />
            </div>
          </div>

          {/* Mục đích sử dụng */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Lý do & mục đích sử dụng
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Người đề xuất
            </label>
            <input
              type="text"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>
        </div>

        {/* Cột phải: Kết quả thẩm định thời gian thực (7 phần) */}
        <div className="lg:col-span-7 space-y-4">
          {aimrmResult && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  2. Kết Quả Thẩm Định Tự Động
                </h3>
                <span className="text-[11px] text-zinc-500">
                  Đánh giá độ an toàn kho
                </span>
              </div>

              {/* Thẻ trạng thái quyết định */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  aimrmResult.status === 'RECOMMENDED_APPROVAL'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                    : aimrmResult.status === 'EXCEEDED_NORM_WARNING'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                    : 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {aimrmResult.status === 'RECOMMENDED_APPROVAL' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {aimrmResult.status === 'EXCEEDED_NORM_WARNING' && (
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    )}
                    {aimrmResult.status === 'REJECTED_OUT_OF_STOCK' && (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-bold tracking-tight">
                        {aimrmResult.status === 'RECOMMENDED_APPROVAL' && 'ĐỀ XUẤT DUYỆT CẤP PHÁT'}
                        {aimrmResult.status === 'EXCEEDED_NORM_WARNING' &&
                          (aimrmResult.isAnomaly ? 'CẢNH BÁO: SỐ LƯỢNG CAO BẤT THƯỜNG' : 'CẢNH BÁO: TỒN KHO XUỐNG DƯỚI MỨC AN TOÀN')}
                        {aimrmResult.status === 'REJECTED_OUT_OF_STOCK' && 'TỪ CHỐI: KHO KHÔNG ĐỦ SỐ LƯỢNG'}
                      </div>
                      <div className="text-xs opacity-90 mt-1 leading-relaxed">
                        {aimrmResult.status === 'RECOMMENDED_APPROVAL' &&
                          'Số lượng yêu cầu nằm hoàn toàn trong định mức tiêu dùng hàng tháng. Kho vẫn duy trì lượng dự phòng an toàn.'}
                        {aimrmResult.status === 'EXCEEDED_NORM_WARNING' &&
                          (aimrmResult.isAnomaly
                            ? 'Số lượng đề xuất cao hơn đáng kể so với mức bình thường của phòng ban này. Cần cán bộ xác nhận lý do trước khi xuất.'
                            : 'Nếu xuất số lượng này, kho sẽ bị giảm xuống dưới ngưỡng dự phòng khẩn cấp. Cần chuẩn bị đơn mua bổ sung.')}
                        {aimrmResult.status === 'REJECTED_OUT_OF_STOCK' &&
                          `Kho chỉ còn ${selectedAsset.currentStock} ${selectedAsset.unit}, không đủ để cấp ${requestedQty} ${selectedAsset.unit}.`}
                      </div>
                    </div>
                  </div>

                  {aimrmResult.isAnomaly && (
                    <span className="px-2 py-1 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[10px] font-bold shrink-0 border border-amber-300 dark:border-amber-700">
                      Tăng đột biến (&gt; 2 lần)
                    </span>
                  )}
                </div>

                {/* Nút hành động trực tiếp */}
                <div className="mt-4 pt-3 border-t border-current/15 flex items-center justify-between gap-3">
                  <div className="text-xs opacity-90">
                    {isAdmin ? (
                      <span>Quyền Quản trị viên: Nhấn nút để xuất kho và tự động trừ số lượng.</span>
                    ) : (
                      <span className="italic">Chế độ Nhân viên: Nhấn để gửi phiếu chờ Quản trị viên duyệt.</span>
                    )}
                  </div>
                  {isAdmin ? (
                    <button
                      onClick={handleDirectApprove}
                      disabled={aimrmResult.isNegativeStock}
                      className="px-4 py-2 text-xs font-semibold rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                    >
                      Duyệt & Xuất Kho Ngay
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setApprovalResult({
                          success: true,
                          message: `Đã gửi phiếu đề xuất xin cấp ${requestedQty} ${selectedAsset?.unit} đến Cán bộ CSVC để chờ duyệt.`,
                        })
                      }
                      className="px-3.5 py-1.5 text-xs font-medium rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Gửi Phiếu Trình Duyệt
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Chỉ số phân tích quan trọng */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                  <div className="text-[11px] text-zinc-500">Mức dự phòng an toàn</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {aimrmResult.safeStock} {selectedAsset.unit}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">Đủ phòng ngừa chậm giao hàng</div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                  <div className="text-[11px] text-zinc-500">Độ chênh lệch so với TB (Z)</div>
                  <div
                    className={`text-lg font-bold mt-0.5 ${
                      aimrmResult.isAnomaly ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {aimrmResult.zScore > 0 ? `+${aimrmResult.zScore}` : aimrmResult.zScore}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    {aimrmResult.isAnomaly ? 'Cao hơn mức bình thường' : 'Trong khoảng định mức'}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                  <div className="text-[11px] text-zinc-500">Tồn kho còn lại sau khi xuất</div>
                  <div
                    className={`text-lg font-bold mt-0.5 ${
                      aimrmResult.projectedStock < 0
                        ? 'text-red-600 dark:text-red-400'
                        : aimrmResult.projectedStock < aimrmResult.safeStock
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {aimrmResult.projectedStock} {selectedAsset.unit}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Hiện có {selectedAsset.currentStock} - Xin cấp {requestedQty}
                  </div>
                </div>
              </div>

              {/* Giải thích công thức rõ ràng, font chữ đẹp, không lỗi */}
              <div className="p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 text-xs">
                  <Info className="w-4 h-4 text-zinc-500" />
                  <span>Cách hệ thống tính toán khoa học:</span>
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed space-y-1">
                  <div>
                    • <strong>Tồn kho an toàn</strong> = Hệ số tin cậy (1.645) × Độ lệch nhu cầu (±{aimrmResult.formulaBreakdown.sigmaD}) × √(Thời gian chờ 1 tuần + 1) = <strong>{aimrmResult.safeStock} {selectedAsset.unit}</strong>.
                  </div>
                  <div>
                    • <strong>Chỉ số chênh lệch Z</strong> = (Số lượng xin cấp {requestedQty} - Nhu cầu trung bình {aimrmResult.formulaBreakdown.meanDemand}) ÷ Độ lệch {aimrmResult.formulaBreakdown.sigmaD} = <strong>{aimrmResult.zScore}</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lịch sử cấp phát tương đồng (Dữ liệu quá khứ) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  3. Dữ Liệu Cấp Phát Quá Khứ Gần Nhất
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500">
                Top 3 lần cấp phát tương tự
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Đối chiếu với các lần cấp phát trước đây cho các phòng ban để đánh giá tính hợp lý:
            </p>

            <div className="space-y-2.5 mt-2">
              {episodes.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400 italic">
                  Chưa có dữ liệu lịch sử cấp phát của vật tư này.
                </div>
              ) : (
                episodes.map((ep) => {
                  const simPercent = Math.round((ep.similarityScore || 0) * 100);
                  return (
                    <div
                      key={ep.id}
                      className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
                          <span className="text-[11px] text-zinc-400">#{ep.id}</span>
                          <span>{ep.department}</span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{ep.date}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-600 dark:text-zinc-400">{ep.note}</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 shrink-0 pl-2">
                          Đã cấp: {ep.pastQuantity} {selectedAsset?.unit}
                        </span>
                      </div>

                      {/* Thanh độ tương đồng */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span>Mức độ tương tự so với yêu cầu hiện tại:</span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {simPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-zinc-800 dark:bg-zinc-200 rounded-full"
                            style={{ width: `${simPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
