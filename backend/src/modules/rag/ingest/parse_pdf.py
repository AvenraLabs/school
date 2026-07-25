import sys
import json
import io

try:
    import pymupdf as fitz  # type: ignore
except ImportError:
    try:
        import fitz  # type: ignore
    except ImportError:
        fitz = None

try:
    import pytesseract  # type: ignore
    from PIL import Image  # type: ignore
    HAS_OCR = True
except Exception:
    pytesseract = None
    Image = None
    HAS_OCR = False

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def do_ocr(img):
    if not HAS_OCR or pytesseract is None:
        return ""
    try:
        try:
            return str(pytesseract.image_to_string(img, lang="eng+tam"))
        except Exception:
            return str(pytesseract.image_to_string(img, lang="eng"))
    except Exception:
        return ""

def extract_pdf_pages(pdf_path):
    if fitz is None:
        raise ImportError("Neither 'pymupdf' nor 'fitz' module is installed.")
    doc = fitz.open(pdf_path)
    pages = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        raw_text = page.get_text("text") or ""
        text = raw_text.strip()
        
        # If extracted text is empty or very minimal (< 50 chars, e.g. scanned image with watermark), fallback to OCR
        if len(text) < 50 and HAS_OCR and Image is not None:
            try:
                pix = page.get_pixmap(dpi=150)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                ocr_text = do_ocr(img)
                if ocr_text and len(ocr_text.strip()) > len(text):
                    text = ocr_text.strip()
            except Exception:
                pass
        
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
