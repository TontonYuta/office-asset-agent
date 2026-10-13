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
