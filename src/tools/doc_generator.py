"""
Document Generation and Visualization Tool.
Đồ án 2: Tự động điền biểu mẫu Word (.docx) và vẽ biểu đồ trực quan (Matplotlib).
"""

from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
import matplotlib
matplotlib.use("Agg")  # Chạy backend không cần GUI
import matplotlib.pyplot as plt

from src.core.config import TEMPLATES_DIR, DATA_DIR
from src.core.database import SessionLocal
from src.models.asset import Asset


def generate_maintenance_ticket_docx(ticket_data: Dict[str, Any]) -> str:
    """
    Tự động xuất file Word (.docx) Phiếu Báo Hỏng & Yêu Cầu Sửa Chữa Thiết Bị chuẩn doanh nghiệp.
    """
    doc = docx.Document()

    # Cấu hình lề trang 2cm
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Tiêu đề Quốc hiệu & Đơn vị
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run1 = p_header.add_run("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc\n")
    run1.bold = True
    run1.font.size = Pt(11)
    run_line = p_header.add_run("---------------o0o---------------\n\n")
    run_line.font.size = Pt(9)

    # Tiêu đề chính của phiếu
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("PHIẾU YÊU CẦU SỬA CHỮA / BÁO HỎNG THIẾT BỊ\n")
    run_title.bold = True
    run_title.font.size = Pt(15)
    run_title.font.color.rgb = RGBColor(0, 51, 102)

    code = ticket_data.get("ticket_code", f"SC-{datetime.now().strftime('%Y%m%d%H%M')}")
    run_code = p_title.add_run(f"Mã phiếu: {code} | Ngày lập: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
    run_code.italic = True
    run_code.font.size = Pt(10)

    # Bảng chi tiết thông tin
    table = doc.add_table(rows=7, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"

    fields = [
        ("Cán bộ / Nhân viên báo hỏng:", ticket_data.get("requester_name", "Nguyễn Hoàng Long")),
        ("Phòng ban / Đơn vị công tác:", ticket_data.get("department", "Phòng Marketing")),
        ("Tên thiết bị & Dòng máy (Model):", ticket_data.get("device_name", "Máy chiếu Epson EB-X06")),
        ("Vị trí đặt thiết bị:", ticket_data.get("location", "Phòng họp số 3")),
        ("Mã sự cố / Hiện tượng hư hỏng:", ticket_data.get("symptom", "Báo No Signal, cáp HDMI không nhận tín hiệu")),
        ("Phương án đề xuất kỹ thuật:", ticket_data.get("proposed_solution", "Kiểm tra thay cáp âm sàn / Bảo hành")),
        ("Trạng thái phê duyệt:", ticket_data.get("status", "CHỜ CÁN BỘ QUẢN TRỊ DUYỆT")),
    ]

    for i, (label, val) in enumerate(fields):
        row = table.rows[i]
        cell_lbl = row.cells[0]
        cell_val = row.cells[1]
        cell_lbl.width = Inches(2.3)
        cell_val.width = Inches(4.5)

        r_l = cell_lbl.paragraphs[0].add_run(label)
        r_l.bold = True
        r_l.font.size = Pt(10.5)

        r_v = cell_val.paragraphs[0].add_run(str(val))
        r_v.font.size = Pt(10.5)

    doc.add_paragraph("\n")

    # Bảng chữ ký
    p_sig = doc.add_paragraph()
    p_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sig.add_run("Hà Nội, ngày ...... tháng ...... năm 2026\n").italic = True

    sig_table = doc.add_table(rows=2, cols=3)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sigs = [
        ("NGƯỜI BÁO HỎNG", "(Ký và ghi rõ họ tên)"),
        ("CÁN BỘ CƠ SỞ VẬT CHẤT", "(Ký duyệt chuyển kỹ thuật)"),
        ("LÃNH ĐẠO PHÒNG BAN", "(Ký và đóng dấu)")
    ]
    for col_idx, (title, note) in enumerate(sigs):
        cell_top = sig_table.rows[0].cells[col_idx]
        cell_bot = sig_table.rows[1].cells[col_idx]
        cell_top.width = Inches(2.2)
        cell_bot.width = Inches(2.2)

        r_t = cell_top.paragraphs[0].add_run(f"{title}\n")
        r_t.bold = True
        r_t.font.size = Pt(10)
        cell_top.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

        r_n = cell_top.paragraphs[0].add_run(f"{note}\n\n\n\n")
        r_n.italic = True
        r_n.font.size = Pt(9)

    # Lưu file
    output_filename = f"Phieu_Bao_Hong_{code}.docx"
    output_path = TEMPLATES_DIR / output_filename
    doc.save(str(output_path))
    return str(output_path)


def generate_inventory_chart(output_path: Optional[str] = None) -> str:
    """
    Tự động vẽ biểu đồ thống kê tồn kho & giá trị bằng Matplotlib.
    """
    if output_path is None:
        output_path = str(DATA_DIR / "bieu_do_ton_kho.png")

    db = SessionLocal()
    try:
        assets = db.query(Asset).filter(Asset.category == "Vật tư tiêu hao").all()
        names = [a.name.split()[0] + " " + a.name.split()[1] if len(a.name.split()) > 1 else a.name for a in assets]
        quantities = [a.quantity for a in assets]

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.8), dpi=100)

        # Biểu đồ cột: Số lượng tồn kho các vật tư tiêu hao
        bars = ax1.bar(names, quantities, color=["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"][:len(names)])
        ax1.set_title("Số Lượng Tồn Kho Vật Tư Tiêu Hao", fontsize=12, fontweight="bold", pad=12)
        ax1.set_ylabel("Số lượng")
        ax1.grid(axis="y", linestyle="--", alpha=0.5)

        for bar in bars:
            height = bar.get_height()
            ax1.annotate(
                f"{height}",
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 3),
                textcoords="offset points",
                ha="center", va="bottom", fontsize=10, fontweight="bold"
            )

        # Biểu đồ tròn: Cơ cấu chủng loại tài sản
        total_consumables = db.query(Asset).filter(Asset.category == "Vật tư tiêu hao").count()
        total_devices = db.query(Asset).filter(Asset.category == "Thiết bị dùng chung").count()
        labels = ["Vật tư tiêu hao", "Thiết bị dùng chung"]
        sizes = [total_consumables, total_devices]
        colors = ["#4CAF50", "#2196F3"]

        ax2.pie(
            sizes,
            labels=labels,
            autopct="%1.1f%%",
            startangle=140,
            colors=colors,
            wedgeprops={"edgecolor": "white", "linewidth": 2}
        )
        ax2.set_title("Cơ Cấu Danh Mục Tài Sản", fontsize=12, fontweight="bold", pad=12)

        plt.tight_layout()
        plt.savefig(output_path, dpi=120)
        plt.close()

        return output_path
    finally:
        db.close()
