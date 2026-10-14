import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  CheckCircle2,
  Package,
  Wrench,
  FileCheck2,
  ScanLine,
  ArrowRight,
  Shield,
  Layers,
  FileText,
  CornerDownLeft,
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { formatVND } from '../../lib/formatters';
import { OCRInvoiceModal } from './OCRInvoiceModal';
import { TicketEscalationModal } from './TicketEscalationModal';
import { sendChatMessageApi } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  intent?: 'Tra cứu kho' | 'Chẩn đoán lỗi' | 'Thẩm định định mức' | 'Quy định CSVC';
  hasMismatch?: boolean;
  mismatchModel?: string;
  alternatives?: { id: string; name: string; model: string; stock: number; location: string }[];
  showEscalationCard?: boolean;
  escalationContext?: {
    assetId: string;
    assetName: string;
    assetModel: string;
    symptom: string;
    preliminaryDiagnosis: string;
    proposedAction: string;
  };
}

interface ChatTabProps {
  onNavigateTab: (tab: string, assetId?: string) => void;
}

export function ChatTab({ onNavigateTab }: ChatTabProps) {
  const { assets } = useInventory();
  const { profile, isAdmin } = useAuth();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [escalationData, setEscalationData] = useState<any>(null);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-01',
      sender: 'assistant',
      timestamp: '08:00',
      content: `Xin chào **${profile.name}**! Tôi là **Trợ lý Quản trị Cơ sở vật chất & Thiết bị Văn phòng**.

Tôi có thể hỗ trợ đồng chí:
- 📦 **Tra cứu kho nhanh**: Kiểm tra số lượng giấy in, mực in, pin thiết bị...
- 🔧 **Tự sửa lỗi máy móc**: Hướng dẫn xử lý kẹt giấy máy in, máy chiếu không lên hình...
- ⚖️ **Kiểm tra định mức**: Đánh giá số lượng xin cấp phát đã hợp lý hay chưa.
- 📄 **Lập phiếu báo hỏng**: Tự động tạo văn bản đề xuất sửa chữa theo mẫu chuẩn Nhà nước (Nghị định 30/2020).

*Đồng chí có thể gõ câu hỏi hoặc bấm vào các gợi ý bên dưới để bắt đầu.*`,
      intent: 'Tra cứu kho',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const apiRes = await sendChatMessageApi(
        query,
        profile.role,
        profile.name,
        profile.department
      );

      if (apiRes && apiRes.response) {
        let intent: Message['intent'] = 'Tra cứu kho';
        if (apiRes.intent === 'support') intent = 'Chẩn đoán lỗi';
        else if (apiRes.intent === 'inventory') intent = 'Tra cứu kho';
        else if (apiRes.intent === 'ocr_restock') intent = 'Thẩm định định mức';
        else if (apiRes.intent === 'enrich') intent = 'Quy định CSVC';

        const isMismatch = apiRes.data?.status === 'model_mismatch';
        const lower = query.toLowerCase();
        const isEscalation =
          apiRes.data?.status === 'ticket_created' ||
          lower.includes('vẫn không được') ||
          lower.includes('không sửa được');

        let alternatives: Message['alternatives'] = undefined;
        if (isMismatch && apiRes.data?.alternatives) {
          alternatives = apiRes.data.alternatives.map((a: any) => ({
            id: a.code || String(a.id),
            name: a.name,
            model: a.model || a.name,
            stock: a.quantity,
            location: a.location,
          }));
        }

        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          content: apiRes.response,
          intent,
          hasMismatch: isMismatch,
          mismatchModel: apiRes.data?.queried_model || '',
          alternatives,
          showEscalationCard: isEscalation,
          escalationContext: isEscalation
            ? {
                assetId: 'TB-MAY-IN-2900',
                assetName: 'Máy in Laser đơn năng Canon LBP 2900',
                assetModel: 'Canon LBP 2900',
                symptom: 'Sự cố thiết bị theo phản ánh của người dùng',
                preliminaryDiagnosis: 'Cần bảo dưỡng kỹ thuật',
                proposedAction: 'Kiểm tra và khắc phục',
              }
            : undefined,
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('Backend chat API failed, using fallback:', err);
    }

    setTimeout(() => {
      const lower = query.toLowerCase();
      let replyContent = '';
      let intent: Message['intent'] = 'Tra cứu kho';
      let hasMismatch = false;
      let mismatchModel = '';
      let alternatives: Message['alternatives'] = undefined;
      let showEscalationCard = false;
      let escalationContext: Message['escalationContext'] = undefined;

      // 1. Nhận diện model không có trong kho: Canon 3300
      if (lower.includes('canon 3300') || lower.includes('lbp 3300') || lower.includes('3300')) {
        intent = 'Tra cứu kho';
        hasMismatch = true;
        mismatchModel = 'Canon LBP 3300';
        alternatives = [
          {
            id: 'TB-201',
            name: 'Máy in Laser Canon LBP 2900',
            model: 'Canon LBP 2900',
            stock: 4,
            location: 'Văn phòng Marketing - Tầng 3',
          },
          {
            id: 'TB-202',
            name: 'Máy in 2 mặt mạng HP LaserJet M404dn',
            model: 'HP LaserJet M404dn',
            stock: 2,
            location: 'Phòng Hành chính - Tầng 2',
          },
        ];
        replyContent = `Thông báo: Thiết bị **Canon LBP 3300** hiện không có trong danh mục tài sản văn phòng của công ty.

Có thể dòng máy này đã ngừng sử dụng hoặc chưa được đăng ký trong sổ kho.

Dưới đây là **các dòng máy in tương đương đang sẵn sàng hoạt động trong kho** mà đồng chí có thể sử dụng:`;
      }
      // 2. Chuyển tiếp lập phiếu báo hỏng khi không tự khắc phục được
      else if (
        lower.includes('vẫn không được') ||
        lower.includes('không được') ||
        lower.includes('kẹt giấy hoài') ||
        lower.includes('vẫn kẹt') ||
        lower.includes('không sửa được') ||
        lower.includes('thử rồi nhưng')
      ) {
        intent = 'Chẩn đoán lỗi';
        showEscalationCard = true;
        escalationContext = {
          assetId: 'TB-201',
          assetName: 'Máy in Laser Canon LBP 2900',
          assetModel: 'Canon LBP 2900',
          symptom: 'Giấy in kẹt liên tục tại khu vực cụm sấy, đèn đỏ nháy dồn dập sau khi đã thử rút giấy kẹt.',
          preliminaryDiagnosis: 'Trục cao su kéo giấy bị mòn hoặc bao lụa sấy rách, vượt quá khả năng tự khắc phục tại chỗ.',
          proposedAction: 'Bảo dưỡng thay thế bao lụa sấy chịu nhiệt và kiểm tra bạc ép trục cuốn Canon EP-303',
        };
        replyContent = `Hệ thống ghi nhận sự cố đã qua các bước xử lý cơ bản nhưng **vẫn chưa khắc phục được**.

Theo quy định quản lý tài sản, thiết bị có nguy cơ bị rách bao lụa sấy hoặc kẹt cơ học sâu bên trong. Để bảo đảm an toàn điện và tránh làm hỏng thêm linh kiện, đồng chí **không nên tự tháo máy**.

Đồng chí vui lòng bấm nút bên dưới để chuyển tiếp yêu cầu đến Cán bộ CSVC:`;
      }
      // 3. Hướng dẫn sửa máy in Canon 2900 kẹt giấy
      else if (
        lower.includes('kẹt giấy') ||
        lower.includes('canon 2900') ||
        lower.includes('lỗi máy in') ||
        lower.includes('nháy đỏ')
      ) {
        intent = 'Chẩn đoán lỗi';
        replyContent = `**Hướng dẫn xử lý Máy in Canon LBP 2900 [Mã sự cố: Kẹt giấy]:**

**Hiện tượng**: Đèn báo lỗi màu đỏ nhấp nháy, giấy kẹt tại khay đỡ hoặc lối ra của máy.

**Quy trình 3 bước tự xử lý an toàn tại chỗ:**
1. **Tắt công tắc nguồn** bên hông máy để máy ngừng gia nhiệt và bảo đảm an toàn điện.
2. **Mở nắp trên**, nhẹ nhàng nhấc hộp mực **Canon EP-303** ra ngoài và đặt lên mặt phẳng sạch.
3. Dùng hai tay cầm đều hai mép giấy kẹt rồi **kéo nhẹ nhàng xuôi theo chiều ra của giấy** (tuyệt đối không giật mạnh làm rách mẩu giấy vụn lọt vào trong cụm sấy).

*Sau khi lắp lại hộp mực và bật máy, nếu in thử mà vẫn tiếp tục kẹt, đồng chí chỉ cần nhắn "vẫn không được" để hệ thống tự lập phiếu báo hỏng.*`;
      }
      // 4. Tra cứu tồn kho giấy in
      else if (
        lower.includes('giấy') ||
        lower.includes('double a') ||
        lower.includes('tồn kho') ||
        lower.includes('mực')
      ) {
        intent = 'Tra cứu kho';
        const a4 = assets.find((a) => a.id === 'VT-101');
        const muc = assets.find((a) => a.id === 'VT-102');
        replyContent = `**Báo cáo tồn kho vật tư thực tế:**

1. **${a4?.name || 'Giấy in Double A A4 70gsm'}** [Mã kho: ${a4?.id || 'VT-101'}]
   - Số lượng còn trong kho: **${a4?.currentStock || 48} ${a4?.unit || 'Gam'}**
   - Mức dự phòng an toàn tối thiểu: **${a4?.minSafeStock || 25} ${a4?.unit || 'Gam'}**
   - Vị trí lưu kho: **${a4?.location || 'Kho tầng 1 - Tủ VT-A1'}**
   - Đơn giá: **${formatVND(a4?.unitPrice || 85000, !isAdmin)}**

2. **${muc?.name || 'Hộp mực máy in Canon Cartridge 303'}** [Mã kho: ${muc?.id || 'VT-102'}]
   - Số lượng còn trong kho: **${muc?.currentStock || 8} ${muc?.unit || 'Hộp'}** (Trạng thái: Sẵn sàng)
   - Vị trí lưu kho: **${muc?.location || 'Kho tầng 1 - Kệ kỹ thuật B3'}**

*Đồng chí có thể mở trang **Kho Vật Tư** để xem toàn bộ danh mục hoặc trang **Thẩm Định Cấp Phát** để lập phiếu xin nhận.*`;
      }
      // 5. Quét hóa đơn
      else if (lower.includes('ocr') || lower.includes('hóa đơn') || lower.includes('quét')) {
        intent = 'Thẩm định định mức';
        setIsOCRModalOpen(true);
        replyContent = `Đã mở cửa sổ **Kiểm Tra & Bóc Tách Hóa Đơn Mua Hàng Tự Động**.

Hệ thống đã nhận diện 3 dòng hàng trên bản scan hóa đơn GTGT số 008129 kèm khung viền vị trí chữ. Đồng chí kiểm tra bảng danh sách và nhấn **"Duyệt Nhập Kho"** để lưu số lượng vào kho.`;
      }
      // Mặc định
      else {
        intent = 'Quy định CSVC';
        replyContent = `Trợ lý đã ghi nhận yêu cầu: "*${query}*".

Đồng chí có thể hỏi tôi:
- Kiểm tra số lượng tồn kho (Giấy in A4 Double A, Mực máy in, Pin điều hòa...).
- Cách tự khắc phục máy in bị kẹt giấy, máy chiếu không lên...
- Thử tra cứu thiết bị không có trong kho (Ví dụ: *"Tìm máy in Canon 3300"*).
- Báo cáo sự cố máy móc để lập **Phiếu báo hỏng chuẩn Nghị định 30**.`;
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        content: replyContent,
        intent,
        hasMismatch,
        mismatchModel,
        alternatives,
        showEscalationCard,
        escalationContext,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleOpenEscalation = (context?: Message['escalationContext']) => {
    setEscalationData(context);
    setIsEscalationModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden transition-colors">
      {/* Chat Top Banner with Quick Actions */}
      <div className="px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            Trợ Lý Tự Động CSVC
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="text-zinc-500 text-[11px]">
            Hỏi đáp kho & hướng dẫn kỹ thuật 24/7
          </span>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsOCRModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <ScanLine className="w-3.5 h-3.5 text-zinc-500" />
            <span>Quét Hóa Đơn Nhập Kho</span>
          </button>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble & Cards */}
              <div className={`space-y-2 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-lg text-xs leading-relaxed inline-block text-left shadow-xs ${
                    isUser
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {/* Markdown-style content rendering */}
                  <div className="whitespace-pre-line space-y-1">
                    {msg.content.split('\n\n').map((para, i) => (
                      <p key={i}>
                        {para.split('**').map((part, j) =>
                          j % 2 === 1 ? (
                            <strong key={j} className="font-semibold text-inherit">
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Intent Badge */}
                  {!isUser && msg.intent && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                        [{msg.intent}]
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}
                </div>

                {/* Thẻ gợi ý thiết bị thay thế khi model không có trong kho */}
                {msg.hasMismatch && (
                  <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-xs space-y-2.5 text-left">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Không tìm thấy model: {msg.mismatchModel}</span>
                    </div>

                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Đồng chí có thể tham khảo các máy in tương đương hiện có trong kho:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.alternatives?.map((alt) => (
                        <div
                          key={alt.id}
                          onClick={() => onNavigateTab('inventory', alt.id)}
                          className="p-2.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400 font-medium">{alt.id}</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Sẵn có: {alt.stock} chiếc
                            </span>
                          </div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs mt-1 truncate">
                            {alt.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {alt.location}
                          </div>
                          <div className="text-[10px] text-zinc-800 dark:text-zinc-200 mt-2 flex items-center gap-1 font-medium">
                            <span>Xem thẻ kho</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thẻ chuyển tiếp lập phiếu báo hỏng */}
                {msg.showEscalationCard && (
                  <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 text-xs space-y-3 text-left animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-red-900 dark:text-red-200 text-xs">
                          Không thể tự sửa tại chỗ? Lập phiếu báo hỏng gửi Cán bộ CSVC
                        </div>
                        <div className="text-[11px] text-red-700 dark:text-red-300/90 mt-0.5 leading-relaxed">
                          Hệ thống đã tự động lấy thông tin máy và chẩn đoán sự cố để lập văn bản chuẩn theo Nghị định 30/2020.
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Thiết bị sự cố:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {msg.escalationContext?.assetName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Chẩn đoán sơ bộ:</span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {msg.escalationContext?.preliminaryDiagnosis}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEscalation(msg.escalationContext)}
                      className="w-full py-2 px-3 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Tạo Phiếu Báo Hỏng Ngay (1 Chạm)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 text-[11px]">Trợ lý đang tra cứu dữ liệu...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-5 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-zinc-400 text-[10px] uppercase font-semibold mr-1 shrink-0">
          Gợi ý hỏi:
        </span>
        {[
          'Tra cứu tồn kho Giấy in A4 Double A',
          'Máy in Canon 2900 bị kẹt giấy',
          'Tìm máy in Canon 3300 trong kho',
          'Tôi đã thử kéo giấy ra nhưng vẫn không được',
          'Quét hóa đơn mua hàng mới',
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-[11px] whitespace-nowrap transition-colors shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi về số lượng tồn kho, cách sửa máy in, tra cứu hóa đơn..."
            className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Gửi</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* OCR Modal */}
      <OCRInvoiceModal isOpen={isOCRModalOpen} onClose={() => setIsOCRModalOpen(false)} />

      {/* Ticket Escalation Modal */}
      <TicketEscalationModal
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        prefillData={escalationData}
        onSuccessNavigate={() => onNavigateTab('tickets')}
      />
    </div>
  );
}
