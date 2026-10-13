# 🎓 Giáo Trình Hướng Dẫn Đồ Án Tốt Nghiệp 15 Tuần: Office Asset Agent

> **Tài liệu Mentorship chính thức từ Giảng viên hướng dẫn — ĐHBK Hà Nội**  
> **Đề tài:** Hệ Thống AI Agent Hỗ Trợ Tra Cứu và Quản Lý Vật Tư - Thiết Bị Phòng Ban (*Office Asset Agent*)  
> **Sinh viên:** Trần Huy Hoàng — MSSV: `20237337`  
> **Đơn vị:** Trường Công nghệ Thông tin & Truyền thông — Đại học Bách Khoa Hà Nội

---

## 🏛️ 1. Giới Thiệu Cấu Trúc Giáo Trình Hàn Lâm

Toàn bộ tài liệu hướng dẫn được tái cấu trúc thành một ấn phẩm học thuật hoàn chỉnh gồm **34 trang**, biên soạn theo chuẩn LaTeX hiện đại với 5 khối cấu trúc sư phạm chuyên sâu cho từng tuần:
1. **Chỉ Thị Của Thầy (Advisor Directive):** Bối cảnh thực tiễn phòng ban, đặt vấn đề & triết lý cốt lõi.
2. **Nghiên Cứu Gốc (Literature Grounding):** Yêu cầu đọc và trích dẫn các bài báo nền tảng (*ReAct, Toolformer, Hallucination Tax arXiv:2602.12631, NIST RBAC, Agent Laboratory, The AI Scientist*).
3. **Giải Phẫu Codebase (Repo Grounding):** Truy vết trực tiếp từng file và module trong `src/` (`models`, `core`, `tools`, `agents`, `ui`).
4. **Thực Hành Tuần (Hands-on Milestone):** Giao việc tự viết code, tạo test case, ghi nhận log và commit Git.
5. **Vấn Đáp Hội Đồng (Defense Checkpoint):** Bộ câu hỏi hóc búa của Thầy phản biện và gợi ý trả lời chuẩn điểm 10.

---

## 📁 2. Cấu Trúc Thư Mục

```text
huong_dan_do_an/
├── main.tex                       # File Master tổng hợp toàn bộ 15 tuần thành cuốn sách
├── main.pdf                       # Ấn phẩm PDF hoàn chỉnh 34 trang, có Mục lục & Trích dẫn BibTeX
├── preamble.tex                   # Khai báo gói, font tiếng Việt, bảng mã màu học thuật, Sharp Boxes
├── references.bib                 # Danh mục 17 công trình nghiên cứu học thuật chuẩn BibTeX
├── figures/                       # Sơ đồ và hình ảnh minh họa
└── chapters/                      # 15 Chuyên đề tương ứng 15 tuần học tập
    ├── tuan_01_khao_sat_nghiep_vu_va_erd.tex
    ├── tuan_02_lap_trinh_orm_sqlite_acid.tex
    ├── tuan_03_ai_agent_hallucination_tax.tex
    ├── tuan_04_langgraph_statemachine.tex
    ├── tuan_05_che_tao_tools_toan_hoc.tex
    ├── tuan_06_web_scraping_resilience.tex
    ├── tuan_07_word_reports_data_viz.tex
    ├── tuan_08_multimodal_vision_ocr.tex
    ├── tuan_09_multiagent_supervisor_swarm.tex
    ├── tuan_10_error_handling_self_healing.tex
    ├── tuan_11_rbac_security_human_in_the_loop.tex
    ├── tuan_12_streamlit_web_ui_architecture.tex
    ├── tuan_13_automated_testing_pytest_ci.tex
    ├── tuan_14_thuc_nghiem_va_danh_gia_dinh_luong.tex
    └── tuan_15_viet_luan_van_va_bao_ve_hoi_dong.tex
```

---

## 🗺️ 3. Danh Sách 15 Tuần Học Tập

| Tuần | Tên Chuyên Đề Học Thuật | File Nguồn LaTeX | Trích Dẫn Trọng Tâm |
| :---: | :--- | :--- | :--- |
| **01** | Khảo sát nghiệp vụ & Thiết kế CSDL 3NF | [`tuan_01`](chapters/tuan_01_khao_sat_nghiep_vu_va_erd.tex) | Edgar F. Codd (1970) CACM |
| **02** | Lập trình ORM SQLAlchemy & Bảo toàn ACID | [`tuan_02`](chapters/tuan_02_lap_trinh_orm_sqlite_acid.tex) | Jim Gray (1981), Härder & Reuter (1983) |
| **03** | AI Agent & Thuế ảo giác số học (*Hallucination Tax*) | [`tuan_03`](chapters/tuan_03_ai_agent_hallucination_tax.tex) | ReAct (ICLR 2023), arXiv:2602.12631 |
| **04** | LangGraph & Mô hình Máy trạng thái hữu hạn | [`tuan_04`](chapters/tuan_04_langgraph_statemachine.tex) | David Harel (1987) Statecharts |
| **05** | Tool 1: Máy tính tồn kho & Token/Alias Matching | [`tuan_05`](chapters/tuan_05_che_tao_tools_toan_hoc.tex) | Levenshtein (1966), Manning et al. (2008) |
| **06** | Tool 2: Cào Web làm giàu tri thức & Khả năng chịu lỗi | [`tuan_06`](chapters/tuan_06_web_scraping_resilience.tex) | Roy Fielding (2000), Circuit Breaker Pattern |
| **07** | Tool 3: Xuất báo cáo Word (.docx) & Biểu đồ | [`tuan_07`](chapters/tuan_07_word_reports_data_viz.tex) | Edward Tufte (2001), NĐ 30/2020/NĐ-CP |
| **08** | Tool 4: Thị giác đa phương thức (Vision OCR) | [`tuan_08`](chapters/tuan_08_multimodal_vision_ocr.tex) | Ray Smith (2007) Tesseract, Multimodal LLMs |
| **09** | Kiến trúc Multi-Agent Swarm & Supervisor Orchestrator | [`tuan_09`](chapters/tuan_09_multiagent_supervisor_swarm.tex) | Agent Laboratory (2025), The AI Scientist |
| **10** | Chu trình Tự khắc phục lỗi (Self-Healing Loop) | [`tuan_10`](chapters/tuan_10_error_handling_self_healing.tex) | Self-Refine (NeurIPS 2023) |
| **11** | An ninh phân quyền RBAC & Giám sát con người (HITL) | [`tuan_11`](chapters/tuan_11_rbac_security_human_in_the_loop.tex) | NIST RBAC (IEEE 1996), AI Safety |
| **12** | Giao diện Web tương tác hiện đại với Streamlit | [`tuan_12`](chapters/tuan_12_streamlit_web_ui_architecture.tex) | Streamlit Reactive Execution, WCAG 2.1 |
| **13** | Kiểm thử tự động hoàn diện (Pytest Suite 8/8 Green) | [`tuan_13`](chapters/tuan_13_automated_testing_pytest_ci.tex) | Kent Beck (2002) TDD, IEEE 1008 |
| **14** | Thử nghiệm thực tế & Đo lường định lượng Before/After | [`tuan_14`](chapters/tuan_14_thuc_nghiem_va_danh_gia_dinh_luong.tex) | Empirical Software Engineering (2012) |
| **15** | Hoàn thiện luận văn 5 chương & Nghệ thuật vấn đáp Điểm 10 | [`tuan_15`](chapters/tuan_15_viet_luan_van_va_bao_ve_hoi_dong.tex) | Quy định ĐATN ĐHBK Hà Nội |

---

## ⚡ 4. Lệnh Biên Dịch Lại LaTeX Sang PDF

Để biên dịch lại ấn phẩm từ mã nguồn, chạy chuỗi lệnh sau trong thư mục `huong_dan_do_an/`:

```bash
pdflatex -interaction=nonstopmode main.tex
bibtex main
pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex
```

File ấn phẩm đầu ra chính thức: [**`main.pdf`**](main.pdf).
