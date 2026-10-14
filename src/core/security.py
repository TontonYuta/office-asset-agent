"""
Security and Role-Based Access Control (RBAC) Module.
Đồ án 2: Phân quyền vai trò Nhân viên (User) và Cán bộ Quản lý (Admin).
"""

from typing import List, Dict, Any, Optional
from src.core.config import ROLE_USER, ROLE_ADMIN

# Danh mục các quyền hạn (Permissions)
PERMISSION_VIEW_INVENTORY = "view_inventory"
PERMISSION_ASK_TROUBLESHOOTING = "ask_troubleshooting"
PERMISSION_SUBMIT_REQUEST = "submit_request"
PERMISSION_OCR_RESTOCK = "ocr_restock"
PERMISSION_APPROVE_TRANSACTIONS = "approve_transactions"
PERMISSION_MANAGE_INVENTORY = "manage_inventory"
PERMISSION_VIEW_FINANCIAL_REPORTS = "view_financial_reports"

# Bảng phân quyền Role-to-Permissions (RBAC Matrix)
ROLE_PERMISSIONS: Dict[str, List[str]] = {
    ROLE_USER: [
        PERMISSION_VIEW_INVENTORY,
        PERMISSION_ASK_TROUBLESHOOTING,
        PERMISSION_SUBMIT_REQUEST,
    ],
    ROLE_ADMIN: [
        PERMISSION_VIEW_INVENTORY,
        PERMISSION_ASK_TROUBLESHOOTING,
        PERMISSION_SUBMIT_REQUEST,
        PERMISSION_OCR_RESTOCK,
        PERMISSION_APPROVE_TRANSACTIONS,
        PERMISSION_MANAGE_INVENTORY,
        PERMISSION_VIEW_FINANCIAL_REPORTS,
    ],
}


def has_permission(role: str, permission: str) -> bool:
    """Kiểm tra một vai trò có quyền thực hiện hành vi cụ thể hay không."""
    allowed_permissions = ROLE_PERMISSIONS.get(role, [])
    return permission in allowed_permissions


def check_role_access(role: str, required_permission: str) -> Dict[str, Any]:
    """Trả về trạng thái cấp quyền hoặc thông điệp từ chối thân thiện."""
    if has_permission(role, required_permission):
        return {"allowed": True, "message": "Truy cập hợp lệ."}
    return {
        "allowed": False,
        "message": (
            f"🚫 [Từ chối truy cập] Thao tác này yêu cầu quyền Quản trị viên (Admin). "
            f"Tài khoản hiện tại ({role.upper()}) chỉ được phép tra cứu và gửi yêu cầu."
        ),
    }


import hashlib
import hmac
import base64
import json
import time
import os


JWT_SECRET = os.getenv("JWT_SECRET", "office-asset-agent-secret-key-2026-b2b-secure")
JWT_EXPIRATION_SECONDS = 86400 * 7  # 7 days


def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def base64url_decode(data: str) -> bytes:
    padding = "=" * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)


def create_jwt_token(payload: Dict[str, Any], expires_in: int = JWT_EXPIRATION_SECONDS) -> str:
    """Tạo JWT token bảo mật chuẩn RFC 7519 với HMAC-SHA256."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload_copy = payload.copy()
    now = int(time.time())
    payload_copy["iat"] = now
    payload_copy["exp"] = now + expires_in

    header_b64 = base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = base64url_encode(json.dumps(payload_copy, separators=(",", ":")).encode("utf-8"))

    msg = f"{header_b64}.{payload_b64}".encode("utf-8")
    sig = hmac.new(JWT_SECRET.encode("utf-8"), msg, hashlib.sha256).digest()
    sig_b64 = base64url_encode(sig)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Xác thực và giải mã JWT token."""
    try:
        parts = token.strip().split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        msg = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), msg, hashlib.sha256).digest()
        actual_sig = base64url_decode(sig_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload = json.loads(base64url_decode(payload_b64).decode("utf-8"))
        if "exp" in payload and time.time() > payload["exp"]:
            return None  # Expired

        return payload
    except Exception:
        return None


def hash_password(password: str, salt: str = "OfficeAssetSalt2026") -> str:
    """Tạo chuỗi băm bảo mật SHA-256 kèm salt cho mật khẩu."""
    salted = f"{salt}:{password}:{salt}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()


def verify_password(password: str, hashed_password: str, salt: str = "OfficeAssetSalt2026") -> bool:
    """Xác thực mật khẩu người dùng với mã băm trong CSDL."""
    if not hashed_password:
        return False
    return hash_password(password, salt=salt) == hashed_password


def user_to_profile(user) -> Dict[str, Any]:
    """Chuyển đổi User model thành format UserProfile frontend."""
    is_admin = user.role == ROLE_ADMIN
    return {
        "id": f"NV-{user.id:03d}" if not is_admin else "CB-HCQT-001",
        "username": user.username,
        "name": user.full_name,
        "role": user.role,
        "roleLabel": "Quản trị viên" if is_admin else "Nhân viên",
        "department": user.department,
        "title": "Phó Trưởng phòng Quản trị CSVC" if is_admin else "Chuyên viên phòng ban",
        "clearanceLabel": "Quản trị viên Toàn quyền" if is_admin else "Cán bộ phòng ban",
        "canViewValuations": is_admin,
        "canAdjustStock": is_admin,
        "canApproveAIMRM": is_admin,
        "canApproveTickets": is_admin,
    }


def authenticate_user(username: str, password: str) -> Optional[Any]:
    """
    Xác thực đăng nhập tài khoản. Trả về đối tượng User nếu hợp lệ, None nếu sai thông tin.
    Hỗ trợ alias 'user' trỏ về 'user1'.
    """
    from src.core.database import SessionLocal
    from src.models.user import User

    db = SessionLocal()
    try:
        uname = username.strip()
        user = db.query(User).filter(User.username == uname).first()
        if not user and uname == "user":
            user = db.query(User).filter(User.username == "user1").first()

        if user and verify_password(password, user.password_hash or ""):
            return user
        return None
    finally:
        db.close()

