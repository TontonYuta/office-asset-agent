"""
Local & Offline LLM Client Module.
Đồ án 2: Hỗ trợ kết nối Local LLM (Ollama / vLLM / Local OpenAI compatible endpoint)
để chạy 100% Offline trên máy tính nội bộ, kèm cơ chế graceful fallback về Rule Engine.
"""

import os
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any

# Cấu hình Local LLM Endpoint (Mặc định là Ollama chạy cục bộ)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
LOCAL_LLM_MODEL = os.getenv("LOCAL_LLM_MODEL", "qwen2.5:latest")
LOCAL_LLM_TIMEOUT = float(os.getenv("LOCAL_LLM_TIMEOUT", "2.0"))


def is_local_llm_available() -> bool:
    """Kiểm tra nhanh xem Ollama cục bộ có đang khởi chạy trên máy hay không."""
    try:
        url = f"{OLLAMA_BASE_URL}/api/tags"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=LOCAL_LLM_TIMEOUT) as response:
            return response.status == 200
    except Exception:
        return False


def call_local_llm(prompt: str, system_prompt: str = "") -> Optional[str]:
    """
    Gửi prompt đến Local LLM (Ollama) qua HTTP Request nội bộ.
    Nếu Ollama không chạy hoặc gặp lỗi timeout, trả về None để fallback sang Rule Engine.
    """
    try:
        url = f"{OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": LOCAL_LLM_MODEL,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "top_p": 0.9,
            }
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=LOCAL_LLM_TIMEOUT) as response:
            if response.status == 200:
                result = json.loads(response.read().decode("utf-8"))
                return result.get("response", "").strip()
    except Exception:
        pass
    return None


def call_local_vision(image_bytes: bytes, prompt: str) -> Optional[str]:
    """
    Gửi ảnh dạng base64 kèm prompt đến Local Vision Model (Qwen2.5-VL / Llava qua Ollama).
    Nếu mô hình thị giác khả dụng, trả về chuỗi văn bản trích xuất; nếu không trả về None.
    """
    try:
        import base64
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        url = f"{OLLAMA_BASE_URL}/api/generate"
        vision_model = os.getenv("LOCAL_VISION_MODEL", "qwen2.5-vl:latest")
        payload = {
            "model": vision_model,
            "prompt": prompt,
            "images": [b64_img],
            "stream": False,
            "options": {
                "temperature": 0.1,
            }
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=LOCAL_LLM_TIMEOUT + 3.0) as response:
            if response.status == 200:
                result = json.loads(response.read().decode("utf-8"))
                return result.get("response", "").strip()
    except Exception:
        pass
    return None


def synthesize_knowledge_with_llm(snippets: str, model_name: str) -> Optional[Dict[str, str]]:
    """
    Sử dụng LLM để đọc hiểu các đoạn cào web thô và tổng hợp thành cấu trúc cẩm nang chuẩn.
    """
    system_prompt = (
        "Bạn là chuyên gia kỹ thuật thiết bị văn phòng. Nhiệm vụ của bạn là tổng hợp các đoạn trích từ internet "
        "thành tài liệu có cấu trúc: (1) Hướng dẫn vận hành 3 bước; (2) Bảng mã lỗi và hướng xử lý."
    )
    user_prompt = (
        f"Thiết bị: {model_name}\n"
        f"Nội dung cào được từ web:\n{snippets}\n\n"
        "Hãy định dạng kết quả dưới dạng JSON có 2 trường: 'manual_text' và 'troubleshooting_guide'. "
        "Chỉ trả về JSON thuần túy."
    )
    res = call_local_llm(user_prompt, system_prompt=system_prompt)
    if not res:
        return None
    try:
        # Lọc json markdown nếu có
        clean_json = res
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[-1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[-1].split("```")[0].strip()
        data = json.loads(clean_json)
        if "manual_text" in data and "troubleshooting_guide" in data:
            return data
    except Exception:
        pass
    return None
