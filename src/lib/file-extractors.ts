import mammoth from "mammoth";
import * as XLSX from "xlsx";

/**
 * Extract plain text from DOCX or XLSX files.
 * Returns null for file types that should go directly to Claude vision (images, PDFs).
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const texts: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      texts.push(`--- ${sheetName} ---\n${csv}`);
    }
    return texts.join("\n\n");
  }

  // Images and PDFs go directly to Claude vision
  return null;
}
