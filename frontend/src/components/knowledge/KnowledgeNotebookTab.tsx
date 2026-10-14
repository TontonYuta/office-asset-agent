import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Wrench,
  Sparkles,
  Search,
  Layers,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { ModelEnrichmentModal } from './ModelEnrichmentModal';

interface DeviceKnowledge {
  id: string;
  model: string;
  name: string;
  category: string;
  operatingSteps: { step: number; title: string; description: string }[];
  errorCodes: { code: string; title: string; symptom: string; fix: string }[];
}

const INITIAL_KNOWLEDGE: DeviceKnowledge[] = [
  {
    id: 'KB-CANON-2900',
    model: 'Canon LBP 2900',
    name: 'Máy in Laser Trắng Đen Canon LBP 2900',
    category: 'Thiết bị văn phòng',
    operatingSteps: [
      {
        step: 1,
        title: 'Kiểm tra nguồn & Nạp giấy',
        description: 'Bật công tắc nguồn phía sau máy. Mở khay nạp giấy phía trước, vỗ tơi xấp giấy A4 Double A và căn chỉnh hai thanh gạt vừa khít mép giấy.',
      },
      {
        step: 2,
        title: 'Cắm cáp & Đặt lệnh in',
        description: 'Kiểm tra cáp USB cắm chắc vào máy tính. Đèn xanh báo sẵn sàng sáng liên tục không nhấp nháy.',
      },
      {
        step: 3,
        title: 'Bảo quản sau khi in',
        description: 'Đóng khay đỡ giấy sau khi hoàn thành để tránh bụi bẩn rơi vào trục cuốn cao su. Tắt nguồn khi hết giờ làm việc.',
      },
    ],
    errorCodes: [
      {
        code: 'Lỗi Kẹt Giấy',
        title: 'Giấy bị giữ lại khay cuốn dưới cụm mực',
        symptom: 'Đèn đỏ nhấp nháy liên tục, máy phát tiếng rít kéo giấy rồi ngưng hoạt động.',
        fix: 'Tắt nguồn máy in, mở nắp trên, nhấc hộp mực EP-303 ra ngoài. Dùng 2 tay nắm đều 2 mép giấy kẹt và kéo nhẹ theo chiều ra của giấy (không giật mạnh làm rách vụn giấy). Lắp lại hộp mực và đóng nắp.',
      },
      {
        code: 'Bản In Trắng / Vệt Đen',
        title: 'Bản in ra trắng tinh hoặc có vệt đen dọc mép trang',
        symptom: 'Giấy in ra không có chữ hoặc xuất hiện vệt đen kéo dài từ đầu đến cuối trang.',
        fix: 'Rút hộp mực ra, kiểm tra trục từ và lò xo tiếp mát bên hông hộp mực. Nếu vệt đen lặp lại đều đặn cách nhau 7.5cm là do trống quang bị xước, cần báo CSVC thay trống mới.',
      },
      {
        code: 'Mất Kết Nối Máy Tính',
        title: 'Máy tính báo không tìm thấy máy in hoặc Offline',
        symptom: 'Lệnh in đã gửi nhưng máy in không phản hồi.',
        fix: 'Rút đầu cắm cáp USB cắm lại sang cổng khác trên máy tính, hoặc khởi động lại máy tính nếu hàng đợi in bị treo.',
      },
    ],
  },
  {
    id: 'KB-HP-M404DN',
    model: 'HP LaserJet M404dn',
    name: 'Máy in 2 mặt qua mạng HP LaserJet Pro M404dn',
    category: 'Thiết bị văn phòng',
    operatingSteps: [
      {
        step: 1,
        title: 'Bật máy & Kiểm tra mạng nội bộ',
        description: 'Nhấn nút nguồn mặt trước. Máy tự động kết nối mạng dây nội bộ của công ty và hiển thị địa chỉ trên màn hình nhỏ.',
      },
      {
        step: 2,
        title: 'Nạp khay giấy lớn (250 tờ)',
        description: 'Kéo hoàn toàn khay số 2, ấn chốt khóa màu xanh để hạ sàn đỡ, nạp cả xấp giấy đến vạch tối đa rồi đẩy khay vào kịch tiếng tách.',
      },
      {
        step: 3,
        title: 'In 2 mặt tự động',
        description: 'Trên máy tính chọn lệnh in, tích chọn mục "In hai mặt tự động" để máy tự lật trang mà không cần lật thủ công.',
      },
    ],
    errorCodes: [
      {
        code: 'Kẹt Đảo Mặt',
        title: 'Kẹt giấy tại bộ phận đảo mặt tự động',
        symptom: 'Màn hình máy in báo lỗi kẹt giấy khi đang in mặt thứ hai.',
        fix: 'Mở nắp cửa phía sau lưng máy, hạ cần gạt màu xanh, rút nhẹ tờ giấy kẹt theo phương ngang rồi đóng chặt cửa sau lại.',
      },
      {
        code: 'Không Nhận Hộp Mực',
        title: 'Máy không nhận diện được hộp mực mới',
        symptom: 'Báo lỗi tiếp xúc chip mực sau khi vừa thay hộp mực mới.',
        fix: 'Mở nắp khoang mực, rút hộp mực ra và dùng khăn khô mềm lau sạch 2 tiếp điểm đồng nhỏ trên chip mực rồi lắp lại.',
      },
      {
        code: 'Bộ Sấy Quá Nhiệt',
        title: 'Cảnh báo nhiệt độ cụm sấy không ổn định',
        symptom: 'Máy khởi động lâu và hiển thị cảnh báo lỗi nhiệt.',
        fix: 'Tắt nguồn máy trong 15 phút để nguội bớt. Nếu bật lại vẫn báo lỗi, liên hệ Cán bộ CSVC thay thế cụm sấy.',
      },
    ],
  },
  {
    id: 'KB-EPSON-EBX06',
    model: 'Epson EB-X06',
    name: 'Máy chiếu hội trường Epson EB-X06 3LCD',
    category: 'Thiết bị dùng chung',
    operatingSteps: [
      {
        step: 1,
        title: 'Mở nắp ống kính & Bật nguồn',
        description: 'Gạt nắp che ống kính sang bên phải. Nhấn nút nguồn Power trên thân máy hoặc điều khiển từ xa, quạt tản nhiệt sẽ bắt đầu quay êm.',
      },
      {
        step: 2,
        title: 'Cắm dây truyền hình ảnh HDMI',
        description: 'Cắm dây HDMI từ laptop vào cổng HDMI 1 trên máy chiếu. Nhấn nút Source Search trên điều khiển để máy tự dò tín hiệu.',
      },
      {
        step: 3,
        title: 'Quy trình tắt máy an toàn',
        description: 'Nhấn nút nguồn 2 lần để tắt máy. TUYỆT ĐỐI KHÔNG RÚT DÂY ĐIỆN NGAY mà phải chờ 90 giây cho quạt dừng hẳn để bảo vệ bóng đèn.',
      },
    ],
    errorCodes: [
      {
        code: 'Quá Nhiệt / Đèn Đỏ',
        title: 'Nhiệt độ máy chiếu quá cao tự ngắt',
        symptom: 'Đèn Temp nhấp nháy đỏ liên tục, sau 5 phút máy chiếu tự ngắt nguồn.',
        fix: 'Tháo màng lọc bụi bên hông máy chiếu, dùng chổi mềm quét sạch bụi bẩn bám trên lưới lọc. Đảm bảo xung quanh máy chiếu không bị vật dụng che chắn lỗ thoát gió.',
      },
      {
        code: 'Báo Thay Bóng',
        title: 'Bóng đèn máy chiếu đạt giới hạn tuổi thọ',
        symptom: 'Đèn Lamp nhấp nháy màu cam, hình ảnh chiếu lên bị mờ tối.',
        fix: 'Lập phiếu đề xuất thay thế bóng chiếu mới gửi Quản trị CSVC phê duyệt.',
      },
      {
        code: 'Không Lên Hình Laptop',
        title: 'Laptop cắm dây HDMI nhưng máy chiếu chỉ có màn hình xanh',
        symptom: 'Máy chiếu không nhận tín hiệu hình ảnh từ máy tính.',
        fix: 'Trên laptop, nhấn tổ hợp phím Windows + P và chọn chế độ Duplicate (Nhân bản màn hình) hoặc cắm lại chắc chắn đầu cáp HDMI.',
      },
    ],
  },
  {
    id: 'KB-TAKSTAR-WGV201',
    model: 'Takstar WGV-201',
    name: 'Bộ Micro Không Dây Hội Thảo Takstar WGV-201',
    category: 'Thiết bị dùng chung',
    operatingSteps: [
      {
        step: 1,
        title: 'Cắm nguồn & Kéo ăng-ten đầu thu',
        description: 'Cắm dây nguồn vào đầu thu micro, dựng thẳng 2 ăng-ten chữ V tạo góc 90 độ để thu sóng âm thanh tối ưu nhất.',
      },
      {
        step: 2,
        title: 'Lắp pin & Bật tay mic',
        description: 'Xoay chuôi tay cầm micro, lắp 2 viên pin AA đúng cực (+/-). Gạt công tắc trên thân mic sang vị trí ON (đèn xanh sáng).',
      },
      {
        step: 3,
        title: 'Chỉnh âm lượng & Tạm ngắt',
        description: 'Vặn nút âm lượng ở hướng 12 giờ để tiếng không bị vỡ. Gạt nấc giữa (Standby) khi tạm thời ngừng phát biểu.',
      },
    ],
    errorCodes: [
      {
        code: 'Tiếng Xì Rè',
        title: 'Loa phát tiếng sôi hoặc tiếng xì lụp bụp',
        symptom: 'Micro phát tiếng sôi rè dù chưa có người phát biểu.',
        fix: 'Vặn nhẹ núm chỉnh độ nhạy (Squelch) phía sau đầu thu để lọc tạp âm; đặt đầu thu cách xa cục phát Wi-Fi ít nhất 2 mét.',
      },
      {
        code: 'Mất Tiếng Chập Chờn',
        title: 'Đi xa bị mất tiếng hoặc âm thanh ngắt quãng',
        symptom: 'Đèn tín hiệu trên đầu thu chớp tắt khi người nói di chuyển trong phòng.',
        fix: 'Kiểm tra ăng-ten đầu thu có bị đồ đạc che khuất hay không; thay 2 viên pin AA mới chất lượng tốt (Panasonic Alkaline).',
      },
    ],
  },
];

export function KnowledgeNotebookTab() {
  const [knowledgeList, setKnowledgeList] = useState<DeviceKnowledge[]>(INITIAL_KNOWLEDGE);
  const [expandedId, setExpandedId] = useState<string>('KB-CANON-2900');
  const [activeSubTab, setActiveSubTab] = useState<Record<string, 'steps' | 'errors'>>({
    'KB-CANON-2900': 'steps',
    'KB-HP-M404DN': 'errors',
    'KB-EPSON-EBX06': 'steps',
    'KB-TAKSTAR-WGV201': 'errors',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnrichOpen, setIsEnrichOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? '' : id));
  };

  const setDeviceSubTab = (deviceId: string, tab: 'steps' | 'errors') => {
    setActiveSubTab((prev) => ({ ...prev, [deviceId]: tab }));
  };

  const handleEnrichSuccess = (newDevice: any) => {
    setKnowledgeList((prev) => [newDevice, ...prev]);
    setExpandedId(newDevice.id);
  };

  const filteredKnowledge = knowledgeList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName =
      item.name.toLowerCase().includes(q) || item.model.toLowerCase().includes(q);
    const matchError = item.errorCodes.some(
      (e) =>
        e.code.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.symptom.toLowerCase().includes(q)
    );
    return matchName || matchError;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              Sổ Tay Kỹ Thuật
            </span>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Hướng Dẫn Vận Hành Chuẩn & Tra Cứu Mã Lỗi Thiết Bị
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Quy trình chuẩn hóa 3 bước dễ hiểu cho nhân viên và hướng dẫn tự xử lý các sự cố thường gặp tại chỗ (máy in, máy chiếu, micro...).
          </p>
        </div>

        <button
          onClick={() => setIsEnrichOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Bổ Sung Thiết Bị Mới</span>
        </button>
      </div>

      {/* Ô tìm kiếm */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-xs transition-colors">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tra cứu sự cố (Kẹt giấy, không lên hình, rè tiếng...) hoặc tên máy..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Danh sách thiết bị dạng nhóm dễ xem */}
      <div className="space-y-3">
        {filteredKnowledge.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-500 italic">
            Không tìm thấy thông tin kỹ thuật nào phù hợp với từ khóa tra cứu.
          </div>
        ) : (
          filteredKnowledge.map((item) => {
            const isExpanded = expandedId === item.id;
            const currentSubTab = activeSubTab[item.id] || 'steps';

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden transition-all"
              >
                {/* Tiêu đề nhóm */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left px-5 py-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Wrench className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-[11px] text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          {item.model}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {item.category} · {item.errorCodes.length} lỗi có hướng dẫn tự sửa · 3 bước vận hành
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Nội dung chi tiết */}
                {isExpanded && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50/40 dark:bg-zinc-950/40 space-y-4">
                    {/* Nút chuyển tab con */}
                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <button
                        onClick={() => setDeviceSubTab(item.id, 'steps')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          currentSubTab === 'steps'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        Quy Trình 3 Bước Sử Dụng Chuẩn
                      </button>
                      <button
                        onClick={() => setDeviceSubTab(item.id, 'errors')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          currentSubTab === 'errors'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Bảng Lỗi & Cách Tự Khắc Phục ({item.errorCodes.length})</span>
                      </button>
                    </div>

                    {/* Xem 3 bước vận hành */}
                    {currentSubTab === 'steps' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {item.operatingSteps.map((step) => (
                          <div
                            key={step.step}
                            className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-[10px]">
                                {step.step}
                              </span>
                              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                {step.title}
                              </h4>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Xem bảng lỗi và cách xử lý tại chỗ */
                      <div className="space-y-2">
                        {item.errorCodes.map((err, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px]">
                                  {err.code}
                                </span>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                  {err.title}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              <div>
                                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                                  Hiện tượng nhận biết:
                                </span>
                                <p className="text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                                  {err.symptom}
                                </p>
                              </div>
                              <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Cách tự xử lý nhanh tại chỗ:</span>
                                </span>
                                <p className="text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed text-[11px]">
                                  {err.fix}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal bổ sung thiết bị mới */}
      <ModelEnrichmentModal
        isOpen={isEnrichOpen}
        onClose={() => setIsEnrichOpen(false)}
        onEnrichSuccess={handleEnrichSuccess}
      />
    </div>
  );
}
