import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, "parse_pdf.py");

/**
 * Parses PDF file using PyMuPDF (fitz) via python child process.
 * Extracts page text and page number.
 * Returns array of pages: [{ pageNumber: 1, text: "..." }]
 *
 * // TODO: OCR support if needed in future for scanned image PDFs
 */
export function parsePdf(pdfPath) {
  return new Promise((resolve, reject) => {
    execFile(
      "python",
      [SCRIPT_PATH, pdfPath],
      { maxBuffer: 50 * 1024 * 1024, encoding: "utf-8" },
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Failed to parse PDF via PyMuPDF: ${error.message} - ${stderr}`));
        }

        try {
          const pages = JSON.parse(stdout.trim());
          if (pages.error) {
            return reject(new Error(`PyMuPDF extraction error: ${pages.error}`));
          }
          resolve(pages);
        } catch (e) {
          reject(new Error(`Invalid JSON output from parse_pdf.py: ${e.message}`));
        }
      }
    );
  });
}
