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


def hash_password(password: str, salt: str = "OfficeAssetSalt2026") -> str:
    """Tạo chuỗi băm bảo mật SHA-256 kèm salt cho mật khẩu."""
    salted = f"{salt}:{password}:{salt}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()


def verify_password(password: str, hashed_password: str, salt: str = "OfficeAssetSalt2026") -> bool:
    """Xác thực mật khẩu người dùng với mã băm trong CSDL."""
    if not hashed_password:
        return False
    return hash_password(password, salt=salt) == hashed_password


def authenticate_user(username: str, password: str) -> Optional[Any]:
    """
    Xác thực đăng nhập tài khoản. Trả về đối tượng User nếu hợp lệ, None nếu sai thông tin.
    """
    from src.core.database import SessionLocal
    from src.models.user import User

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username.strip()).first()
        if user and verify_password(password, user.password_hash or ""):
            return user
        return None
    finally:
        db.close()
