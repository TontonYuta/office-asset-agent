"""
Central Multi-Agent Orchestrator using LangGraph.
Đồ án 2: Bộ điều phối luồng trung tâm (Workflow Controller), phân quyền RBAC và Human-in-the-Loop.
"""

from typing import Dict, Any, TypedDict, Optional
from langgraph.graph import StateGraph, START, END

from src.core.config import ROLE_USER, ROLE_ADMIN
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


def classify_and_auth(state: AgentState) -> AgentState:
    """
    Phân loại ý định (Intent Classification) & Kiểm tra bảo mật phân quyền (RBAC Check).
    """
    msg = state["user_message"].lower()
    has_image = state.get("image_source") is not None

    # 1. Trường hợp gửi ảnh hóa đơn / phiếu giao hàng
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

    # 2. Trường hợp tự động tìm kiếm / làm giàu tri thức theo model máy
    if any(k in msg for k in ["làm giàu", "tìm tài liệu", "thêm model", "thêm thiết bị", "tra cứu model", "manual"]):
        state["intent"] = "enrich"
        return state

    # 3. Trường hợp hỗ trợ kỹ thuật & xử lý sự cố thiết bị
    support_keywords = [
        "hỏng", "sự cố", "lỗi", "không lên", "no signal", "kẹt giấy",
        "offline", "hú", "mất tiếng", "máy chiếu", "máy in", "micro",
        "báo hỏng", "sửa chữa", "khắc phục", "không được"
    ]
    if any(k in msg for k in support_keywords) and not ("còn bao nhiêu" in msg or "còn không" in msg):
        state["intent"] = "support"
        return state

    # 4. Mặc định là tra cứu tồn kho / thống kê
    state["intent"] = "inventory"
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
    if intent == "blocked":
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

# Biên dịch Graph
orchestrator_graph = builder.compile()


def process_user_request(
    message: str,
    role: str = ROLE_USER,
    user_name: str = "Nguyễn Hoàng Long",
    department: str = "Phòng Marketing",
    image_source: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Điểm vào duy nhất (Single Entrypoint) xử lý request của người dùng thông qua LangGraph.
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
    }

    final_state = orchestrator_graph.invoke(initial_state)
    return {
        "intent": final_state["intent"],
        "response": final_state["response"],
        "data": final_state.get("data", {}),
    }
