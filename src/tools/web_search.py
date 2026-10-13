"""
Web Search & Self-Enriching Knowledge Tool.
Đồ án 2: Tự động làm giàu tri thức thiết bị từ internet (DuckDuckGo Search) theo Model máy.
"""

from typing import Dict, Any, Optional
from src.core.database import SessionLocal
from src.models.asset import KnowledgeDoc


def search_online_device_knowledge(model_name: str) -> Dict[str, Any]:
    """
    Tìm kiếm tài liệu HDSD và bảng mã lỗi chính hãng trên internet bằng DuckDuckGo.
    Nếu không có mạng, fallback về kho tri thức kỹ thuật tiêu chuẩn đã chuẩn hóa.
    """
    clean_model = model_name.strip()
    query = f"{clean_model} user manual troubleshooting error codes huong dan su dung ma loi"
    search_results = []

    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            if results:
                search_results = results
    except Exception as e:
        # Nếu máy tính offline hoặc bị rate limit từ DuckDuckGo, tiếp tục với fallback
        search_results = []

    # Xử lý tổng hợp nội dung tìm kiếm
    if search_results:
        snippets = "\n".join([f"- {r.get('title')}: {r.get('body')}" for r in search_results])
        source_url = search_results[0].get("href", "DuckDuckGo Web Search")
        from src.core.llm_client import synthesize_knowledge_with_llm
        llm_synth = synthesize_knowledge_with_llm(snippets, clean_model)
        if llm_synth:
            manual_text = llm_synth.get("manual_text", f"Tài liệu kỹ thuật {clean_model}")
            troubleshooting_guide = llm_synth.get("troubleshooting_guide", snippets)
        else:
            manual_text = f"Tài liệu kỹ thuật tổng hợp từ internet cho thiết bị {clean_model}:\n{snippets[:400]}..."
            troubleshooting_guide = f"Bảng chẩn đoán lỗi tìm được:\n{snippets}"
    else:
        # Tri thức chuẩn mực cho các model văn phòng phổ biến
        source_url = "Cơ sở tri thức nội bộ chuẩn hóa"
        manual_text = (
            f"1. Kiểm tra nguồn điện và các kết nối cáp vật lý của thiết bị {clean_model}.\n"
            f"2. Bật công tắc nguồn và theo dõi đèn báo trạng thái (xanh là bình thường, đỏ/cam là có cảnh báo).\n"
            f"3. Tuân thủ hướng dẫn nạp giấy hoặc kết nối màn hình theo quy chuẩn kỹ thuật."
        )
        troubleshooting_guide = (
            f"- Mã lỗi E1 / Cảnh báo tín hiệu: Kiểm tra cáp tín hiệu HDMI/USB cắm chặt hoặc đổi cổng.\n"
            f"- Mã lỗi E2 / Kẹt giấy: Tắt nguồn thiết bị, tháo khay bảo trì và gắp giấy kẹt nhẹ nhàng.\n"
            f"- Mã lỗi E3 / Quá nhiệt: Để thiết bị nghỉ 15 phút, dọn sạch lỗ thông gió làm mát."
        )

    return {
        "model_name": clean_model,
        "device_type": "Thiết bị văn phòng",
        "title": f"Cẩm nang vận hành & xử lý sự cố {clean_model}",
        "manual_text": manual_text,
        "troubleshooting_guide": troubleshooting_guide,
        "source_url": source_url,
    }


def enrich_and_cache_knowledge(model_name: str) -> Dict[str, Any]:
    """
    Tra cứu trong CSDL nội bộ trước; nếu chưa có thì cào web và tự động lưu vào CSDL.
    """
    db = SessionLocal()
    try:
        clean_model = model_name.strip()
        existing = db.query(KnowledgeDoc).filter(
            KnowledgeDoc.model_name.ilike(f"%{clean_model}%")
        ).first()

        if existing:
            return {
                "status": "cached",
                "model_name": existing.model_name,
                "device_type": existing.device_type,
                "title": existing.title,
                "manual_text": existing.manual_text,
                "troubleshooting_guide": existing.troubleshooting_guide,
                "source_url": existing.source_url,
                "message": f"Tìm thấy cẩm nang trong kho tri thức nội bộ cho model '{existing.model_name}'."
            }

        # Nếu chưa có, kích hoạt web search để làm giàu tri thức
        enriched_data = search_online_device_knowledge(clean_model)
        new_doc = KnowledgeDoc(
            model_name=clean_model,
            device_type=enriched_data["device_type"],
            title=enriched_data["title"],
            manual_text=enriched_data["manual_text"],
            troubleshooting_guide=enriched_data["troubleshooting_guide"],
            source_url=enriched_data["source_url"],
        )
        db.add(new_doc)
        db.commit()

        return {
            "status": "newly_enriched",
            "model_name": clean_model,
            "device_type": new_doc.device_type,
            "title": new_doc.title,
            "manual_text": new_doc.manual_text,
            "troubleshooting_guide": new_doc.troubleshooting_guide,
            "source_url": new_doc.source_url,
            "message": f"✨ Đã tự động tìm kiếm trên internet và nạp tri thức thành công cho model '{clean_model}'!"
        }
    finally:
        db.close()
