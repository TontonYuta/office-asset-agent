"""
Central Multi-Agent Orchestrator using LangGraph.
Đồ án 2: Bộ điều phối luồng trung tâm (Workflow Controller), phân quyền RBAC và Human-in-the-Loop.
"""

import re
import sqlite3
from typing import Dict, Any, TypedDict, Optional, List
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from src.core.config import ROLE_USER, ROLE_ADMIN, DATA_DIR
from src.core.security import check_role_access, PERMISSION_OCR_RESTOCK
from src.agents.support_agent import handle_support_query
from src.agents.enrich_agent import handle_enrich_query
from src.agents.inventory_agent import handle_inventory_query
from src.tools.vision_ocr import parse_delivery_receipt


class AgentState(TypedDict):
    """Trạng thái luồng xử lý của hệ thống Agent."""
    user_message: str
    user_role: str
    user_name: str
    department: str
    image_source: Optional[Any]
    intent: str
    response: str
    data: Dict[str, Any]
    last_device: Optional[str]
    last_location: Optional[str]


def classify_and_auth(state: AgentState) -> AgentState:
    """
    Phân loại ý định (Intent Classification) & Kiểm tra bảo mật phân quyền (RBAC Check).
    Tích hợp Out-of-Scope Guardrail và phân định chính xác giữa tra cứu tồn kho vs hỗ trợ sự cố.
    """
    msg = state["user_message"].lower().strip()
    has_image = state.get("image_source") is not None

    # 1. Trường hợp gửi ảnh hóa đơn / phiếu giao hàng (Admin only)
    if has_image or "nhập kho" in msg or "hóa đơn" in msg or "phiếu giao" in msg:
        if state["user_role"] != ROLE_ADMIN:
            state["intent"] = "blocked"
            state["response"] = (
                "🚫 **Từ chối truy cập:** Chức năng đọc ảnh hóa đơn và nhập kho tự động "
                "bắt buộc phải có quyền **Cán bộ Quản lý (Admin)** để đảm bảo an toàn số liệu CSDL."
            )
            return state
        state["intent"] = "ocr_restock"
        return state

    # 2. Trường hợp chào hỏi, giới thiệu danh tính (Greeting)
    clean_msg = re.sub(r"[^\w\s]", " ", msg).strip()
    greeting_keywords = [
        "chào", "hello", "hi bot", "xin chào", "bạn là ai", "bạn tên gì", "giới thiệu",
        "help", "trợ giúp", "hướng dẫn", "bạn có thể làm gì", "chức năng của bạn"
    ]
    if any(k in clean_msg for k in greeting_keywords) and len(clean_msg.split()) <= 10:
        state["intent"] = "greeting"
        state["response"] = (
            "👋 Xin chào! Tôi là **Office Asset Agent** — Trợ lý AI chuyên trách hỗ trợ quản lý vật tư và thiết bị văn phòng.\n\n"
            "Tôi có thể hỗ trợ bạn các nghiệp vụ chính sau:\n"
            "- 📦 **Tra cứu vật tư & thiết bị:** Kiểm tra tồn kho, vị trí đặt máy móc (giấy A4, bút viết, mực in, máy in, máy chiếu...)\n"
            "- 🛠️ **Hỗ trợ kỹ thuật:** Hướng dẫn khắc phục sự cố máy móc hoặc tự động lập Phiếu Báo Hỏng chuẩn mẫu Word\n"
            "- 📋 **Thẩm định cấp phát:** Kiểm tra định mức tồn kho an toàn và đề xuất phân bổ vật tư\n"
            "- 🌐 **Làm giàu tri thức:** Tự động tra cứu cẩm nang kỹ thuật theo model máy trên mạng\n\n"
            "Bạn đang cần hỗ trợ vấn đề gì tại phòng ban?"
        )
        return state

    # 3. Guardrail: Nhận diện câu hỏi ngoài phạm vi nghiệp vụ (Out-of-Scope / Chitchat)
    out_of_scope_keywords = [
        "ăn gì", "món ăn", "uống gì", "quán ăn", "cơm", "bún", "phở", "thời tiết", "nhiệt độ", "mưa", "nắng",
        "kể chuyện", "đố vui", "bài thơ", "hát", "game", "phim", "bóng đá", "thể thao",
        "lập trình", "viết code", "chứng khoán", "tiền ảo", "bitcoin", "tổng thống", "chính trị"
    ]
    if any(k in msg for k in out_of_scope_keywords):
        state["intent"] = "out_of_scope"
        state["response"] = (
            f"🚫 **Yêu cầu ngoài phạm vi hỗ trợ:**\n\n"
            f"Câu hỏi của bạn (*'{state['user_message']}'*) không thuộc nghiệp vụ quản lý vật tư - thiết bị văn phòng doanh nghiệp.\n\n"
            f"Tôi là trợ lý AI chuyên biệt cho các công việc:\n"
            f"- Tra cứu tồn kho và vị trí thiết bị phòng ban\n"
            f"- Hướng dẫn sửa chữa sự cố thiết bị hoặc lập Phiếu Báo Hỏng\n"
            f"- Thẩm định định mức cấp phát vật tư an toàn\n\n"
            f"Vui lòng gửi câu hỏi liên quan đến tài sản, vật tư hoặc thiết bị văn phòng!"
        )
        return state

    # 4. Trường hợp tự động tìm kiếm / làm giàu tri thức theo model máy
    if any(k in msg for k in ["làm giàu", "tìm tài liệu", "thêm model", "thêm thiết bị", "tra cứu model", "manual"]):
        state["intent"] = "enrich"
        return state

    # 5. Phân định: Hỗ trợ kỹ thuật & xử lý sự cố thiết bị (Support) vs Tra cứu vị trí / tồn kho (Inventory)
    trouble_keywords = [
        "hỏng", "sự cố", "báo lỗi", "bị lỗi", "không lên", "no signal", "kẹt giấy",
        "offline", "hú", "mất tiếng", "báo hỏng", "sửa chữa", "khắc phục", "không được",
        "không in được", "vệt đen", "hết pin", "thay cáp", "gọi thợ", "chập", "rách"
    ]

    presence_inventory_keywords = [
        "có trong phòng không", "có ở phòng", "có ở đây không", "còn bao nhiêu", "còn không",
        "ở đâu", "phòng nào có", "đặt ở đâu", "tìm thấy ở đâu", "mượn", "xin cấp", "xuất kho", "giá trị"
    ]

    has_trouble = any(k in msg for k in trouble_keywords)
    is_asking_presence = any(k in msg for k in presence_inventory_keywords)

    if has_trouble and not is_asking_presence:
        state["intent"] = "support"
        return state

    # 6. Kiểm tra từ khóa nghiệp vụ kho / thiết bị / phòng ban
    domain_keywords = [
        "kho", "máy", "thiết bị", "vật tư", "tài sản", "giấy", "bút", "mực", "pin", "cáp",
        "micro", "mic", "loa", "projector", "printer", "canon", "epson", "hp", "takstar",
        "double a", "thiên long", "energizer", "ugreen", "phòng", "còn", "có", "hết",
        "tồn", "xuất", "nhập", "cấp", "biểu đồ", "thống kê", "chi phí", "giá", "ngân sách",
        "model", "định mức", "an toàn", "safe stock", "aim-rm"
    ]
    if any(k in msg for k in domain_keywords):
        state["intent"] = "inventory"
        return state

    # 7. Fallback Out-of-Scope nếu câu hỏi không khớp bất kỳ ngữ cảnh nào
    state["intent"] = "out_of_scope"
    state["response"] = (
        f"Tôi chưa hiểu rõ yêu cầu: *'{state['user_message']}'*.\n\n"
        f"Hệ thống chỉ hỗ trợ tra cứu vật tư, kiểm tra thiết bị văn phòng, hướng dẫn khắc phục sự cố hoặc lập phiếu báo hỏng.\n"
        f"Bạn có thể thử các câu hỏi như:\n"
        f"- *'Kho còn bao nhiêu ram giấy in A4?'*\n"
        f"- *'Máy in Canon 2900 đặt ở phòng nào?'*\n"
        f"- *'Máy chiếu phòng họp báo No Signal thì làm sao?'*"
    )
    return state


def run_inventory_node(state: AgentState) -> AgentState:
    res = handle_inventory_query(
        state["user_message"],
        user_role=state["user_role"],
        department=state.get("department", "Phòng Ban Chức Năng")
    )
    state["response"] = res["response"]
    state["data"] = res
    return state


def run_support_node(state: AgentState) -> AgentState:
    res = handle_support_query(
        state["user_message"],
        user_name=state["user_name"],
        dept=state["department"]
    )
    state["response"] = res["response"]
    state["data"] = res
    return state


def run_enrich_node(state: AgentState) -> AgentState:
    res = handle_enrich_query(state["user_message"])
    state["response"] = res["response"]
    state["data"] = res
    return state


def run_ocr_node(state: AgentState) -> AgentState:
    res = parse_delivery_receipt(state.get("image_source"))
    state["response"] = res["message"]
    state["data"] = res
    return state


def route_intent(state: AgentState) -> str:
    """Hàm điều hướng có điều kiện cho LangGraph."""
    intent = state.get("intent", "inventory")
    if intent in ["blocked", "out_of_scope", "greeting"]:
        return END
    elif intent == "ocr_restock":
        return "ocr_node"
    elif intent == "enrich":
        return "enrich_node"
    elif intent == "support":
        return "support_node"
    else:
        return "inventory_node"


# Xây dựng LangGraph StateGraph
builder = StateGraph(AgentState)

# Thêm các Node
builder.add_node("classify_and_auth", classify_and_auth)
builder.add_node("inventory_node", run_inventory_node)
builder.add_node("support_node", run_support_node)
builder.add_node("enrich_node", run_enrich_node)
builder.add_node("ocr_node", run_ocr_node)

# Thiết lập Luồng nối (Edges)
builder.add_edge(START, "classify_and_auth")
builder.add_conditional_edges(
    "classify_and_auth",
    route_intent,
    {
        "inventory_node": "inventory_node",
        "support_node": "support_node",
        "enrich_node": "enrich_node",
        "ocr_node": "ocr_node",
        END: END
    }
)

builder.add_edge("inventory_node", END)
builder.add_edge("support_node", END)
builder.add_edge("enrich_node", END)
builder.add_edge("ocr_node", END)

# Biên dịch Graph với bộ nhớ lưu vết phiên làm việc (Persistent LangGraph SqliteSaver)
try:
    from langgraph.checkpoint.sqlite import SqliteSaver
    CHECKPOINT_DB_PATH = DATA_DIR / "agent_checkpoints.sqlite"
    CHECKPOINT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    _checkpoint_conn = sqlite3.connect(str(CHECKPOINT_DB_PATH), check_same_thread=False)
    checkpointer = SqliteSaver(_checkpoint_conn)
    checkpointer.setup()
except Exception:
    checkpointer = MemorySaver()

orchestrator_graph = builder.compile(checkpointer=checkpointer)


def process_user_request(
    message: str,
    role: str = ROLE_USER,
    user_name: str = "Nguyễn Hoàng Long",
    department: str = "Phòng Marketing",
    image_source: Optional[Any] = None,
    thread_id: str = "default_session"
) -> Dict[str, Any]:
    """
    Điểm vào duy nhất (Single Entrypoint) xử lý request của người dùng thông qua LangGraph.
    Hỗ trợ bộ nhớ phiên làm việc nhiều lượt (Multi-turn Memory Persistence qua MemorySaver).
    """
    initial_state: AgentState = {
        "user_message": message,
        "user_role": role,
        "user_name": user_name,
        "department": department,
        "image_source": image_source,
        "intent": "",
        "response": "",
        "data": {},
        "last_device": None,
        "last_location": None,
    }

    config = {"configurable": {"thread_id": thread_id}}
    final_state = orchestrator_graph.invoke(initial_state, config=config)
    return {
        "intent": final_state["intent"],
        "response": final_state["response"],
        "data": final_state.get("data", {}),
        "thread_id": thread_id,
    }
