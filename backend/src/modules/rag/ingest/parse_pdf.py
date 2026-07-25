import sys
import json
import pymupdf as fitz  # PyMuPDF

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def extract_pdf_pages(pdf_path):
    # TODO: OCR support if needed in future for scanned image PDFs
    doc = fitz.open(pdf_path)
    pages = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text") or ""
        pages.append({
            "pageNumber": page_num + 1,
            "text": text
        })
    doc.close()
    return pages

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No PDF path provided"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    try:
        pages = extract_pdf_pages(pdf_path)
        print(json.dumps(pages, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
