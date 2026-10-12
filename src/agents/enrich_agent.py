"""
Self-Enriching Knowledge Agent.
Đồ án 2: Tự động tra cứu tài liệu từ internet theo Model máy và nạp vào CSDL nội bộ.
"""

from typing import Dict, Any
import re
from src.tools.web_search import enrich_and_cache_knowledge


def handle_enrich_query(user_message: str) -> Dict[str, Any]:
    """
    Trích xuất tên Model từ câu lệnh của cán bộ/người dùng và thực hiện tự động làm giàu tri thức.
    """
    # Regex hoặc pattern tìm model máy
    patterns = [
        r"(?:model|máy|thiết bị|dòng)\s+([A-Za-z0-9\-\s]{3,30})",
        r"(?:thêm|tra cứu|tìm tài liệu)\s+([A-Za-z0-9\-\s]{3,30})",
    ]

    extracted_model = None
    for p in patterns:
        match = re.search(p, user_message, re.IGNORECASE)
        if match:
            extracted_model = match.group(1).strip()
            break

    if not extracted_model:
        # Fallback lấy phần sau dấu hai chấm nếu có
        if ":" in user_message:
            extracted_model = user_message.split(":")[-1].strip()
        else:
            extracted_model = "Canon LBP 2900"

    # Thực hiện tra cứu và nạp tri thức
    result = enrich_and_cache_knowledge(extracted_model)

    response_text = (
        f"{result.get('message', '')}\n\n"
        f"📋 **Hồ sơ kỹ thuật số: {result.get('model_name')}**\n"
        f"* **Loại thiết bị:** {result.get('device_type')}\n"
        f"* **Nguồn:** {result.get('source_url')}\n\n"
        f"📖 **Tóm tắt HDSD:**\n{result.get('manual_text')}\n\n"
        f"🛠️ **Bảng chẩn đoán lỗi:**\n{result.get('troubleshooting_guide')}"
    )

    return {
        "status": "success",
        "model_name": extracted_model,
        "response": response_text
    }
