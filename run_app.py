#!/usr/bin/env python3
"""
Launcher script for Office Asset Agent.
Starts the FastAPI Backend Server serving both the REST API and the React SPA Frontend.
"""

import sys
import argparse
import webbrowser
import threading
import time
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import uvicorn
from src.core.init_db import init_database


def open_browser(url: str, delay: float = 1.2):
    """Open user's default browser after the server has booted."""
    time.sleep(delay)
    webbrowser.open(url)


def run_desktop_window(url: str):
    """Open native desktop window via pywebview if installed."""
    try:
        import webview
        print(f"🖥️  Đang khởi tạo cửa sổ Desktop cho Office Asset Agent...")
        webview.create_window(
            title="🏢 Office Asset Agent - Quản Trị Cơ Sở Vật Chất Doanh Nghiệp",
            url=url,
            width=1320,
            height=860,
            resizable=True,
            min_size=(1024, 680)
        )
        webview.start()
    except ImportError:
        print("⚠️  Chưa cài đặt pywebview. Đang mở qua trình duyệt mặc định...")
        open_browser(url)


def main():
    parser = argparse.ArgumentParser(description="Office Asset Agent Enterprise Server")
    parser.add_argument("--host", default="0.0.0.0", help="Host address (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port (default: 8000)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically")
    parser.add_argument("--desktop", action="store_true", help="Launch in a standalone desktop window (pywebview)")

    args = parser.parse_args()

    # Pre-flight database check
    print("📦 Khởi tạo và kiểm tra cơ sở dữ liệu SQLite...")
    init_database()

    app_url = f"http://127.0.0.1:{args.port}"

    print("=" * 65)
    print("  🏢 OFFICE ASSET AGENT — ENTERPRISE MULTI-AGENT SYSTEM")
    print("  Đồ án 2: Hệ Thống AI Hỗ Trợ Quản Lý Vật Tư & Thiết Bị Văn Phòng")
    print("=" * 65)
    print(f"  🌐 Web App:      {app_url}")
    print(f"  📚 Swagger Docs: {app_url}/docs")
    print(f"  📂 Mạng LAN:     http://<IP_MAY_TRAM>:{args.port}")
    print("=" * 65)
    print("  Nhấn Ctrl+C để dừng máy chủ.\n")

    if args.desktop:
        # Run server in daemon thread and launch pywebview in main thread
        server_thread = threading.Thread(
            target=lambda: uvicorn.run("src.api.server:app", host="127.0.0.1", port=args.port, log_level="warning"),
            daemon=True
        )
        server_thread.start()
        run_desktop_window(app_url)
    else:
        if not args.no_browser:
            threading.Thread(target=open_browser, args=(app_url,), daemon=True).start()

        uvicorn.run(
            "src.api.server:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level="info"
        )


if __name__ == "__main__":
    main()
