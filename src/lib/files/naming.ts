const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const PATH_SEPARATORS = /[/\\:]/g;

export function sanitizeVisibleFileName(fileName: string) {
  const cleaned = fileName.replace(CONTROL_CHARS, "").replace(PATH_SEPARATORS, "-").trim();
  return cleaned.length > 0 ? cleaned : "dokumen";
}

export function buildOutputFileName(inputName: string) {
  const safeName = sanitizeVisibleFileName(inputName);
  const pdfExtension = /\.pdf$/i;

  if (pdfExtension.test(safeName)) {
    return safeName.replace(pdfExtension, "_Proses.pdf");
  }

  return `${safeName}_Proses.pdf`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
