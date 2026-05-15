import { PDFDocument } from "pdf-lib";

import type { PdfValidationResult } from "@/types/cover-maker";

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];

export const PDF_LIMITS = {
  mainFileBytes: 100 * 1024 * 1024,
  coverFileBytes: 25 * 1024 * 1024,
} as const;

export class PdfValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfValidationError";
  }
}

export function hasPdfExtension(fileName: string) {
  return /\.pdf$/i.test(fileName.trim());
}

export function hasPdfSignature(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  if (view.byteLength < PDF_SIGNATURE.length) {
    return false;
  }

  return PDF_SIGNATURE.every((byte, index) => view[index] === byte);
}

export function validatePdfFileHint(file: File, limitBytes: number) {
  if (!hasPdfExtension(file.name)) {
    throw new PdfValidationError("File harus memiliki ekstensi .pdf.");
  }

  if (file.size <= 0) {
    throw new PdfValidationError("File PDF kosong.");
  }

  if (file.size > limitBytes) {
    throw new PdfValidationError("Ukuran file terlalu besar untuk diproses di browser.");
  }

  if (file.type && file.type !== "application/pdf") {
    throw new PdfValidationError("Tipe file tidak dikenali sebagai PDF.");
  }
}

export async function validatePdfBytes(
  bytes: ArrayBuffer | Uint8Array,
): Promise<PdfValidationResult> {
  const byteLength = bytes.byteLength;

  if (byteLength <= 0) {
    throw new PdfValidationError("File PDF kosong.");
  }

  if (!hasPdfSignature(bytes)) {
    throw new PdfValidationError("File tidak memiliki signature PDF yang valid.");
  }

  try {
    const document = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
    const pageCount = document.getPageCount();

    if (pageCount < 1) {
      throw new PdfValidationError("PDF tidak memiliki halaman.");
    }

    return {
      pageCount,
      byteLength,
    };
  } catch (error) {
    if (error instanceof PdfValidationError) {
      throw error;
    }

    throw new PdfValidationError(
      "PDF tidak dapat dibaca. File mungkin rusak, terenkripsi, atau dilindungi password.",
    );
  }
}

export async function readAndValidatePdfFile(file: File, limitBytes: number) {
  validatePdfFileHint(file, limitBytes);
  const bytes = await file.arrayBuffer();
  const result = await validatePdfBytes(bytes);

  return {
    bytes,
    result,
  };
}
