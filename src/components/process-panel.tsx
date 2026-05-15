"use client";

import { Download, FileCheck2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { CATEGORY_LABELS, getCoversForProcess, getDefaultCover } from "@/lib/default-covers";
import { buildOutputFileName, formatFileSize } from "@/lib/files/naming";
import { mergePdfSequence } from "@/lib/pdf/merge";
import { PDF_LIMITS, validatePdfFileHint } from "@/lib/pdf/validate";
import type { CoverCategory, CoverRole, CoverStockItem } from "@/types/cover-maker";

type ProcessPanelProps = {
  category: CoverCategory;
  description: string;
  localCovers: CoverStockItem[];
};

async function getCoverBytes(cover: CoverStockItem) {
  if (cover.publicPath) {
    const response = await fetch(cover.publicPath);

    if (!response.ok) {
      throw new Error(`Gagal membaca ${cover.fileName}.`);
    }

    return response.arrayBuffer();
  }

  if (cover.blob) {
    return cover.blob.arrayBuffer();
  }

  throw new Error(`Cover ${cover.fileName} tidak memiliki sumber file.`);
}

function getCoverById(
  covers: CoverStockItem[],
  category: CoverCategory,
  role: CoverRole,
  coverId: string,
) {
  return covers.find((cover) => cover.id === coverId) ?? getDefaultCover(category, role);
}

function downloadPdf(bytes: Uint8Array, fileName: string) {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);

  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function ProcessPanel({ category, description, localCovers }: ProcessPanelProps) {
  const defaultFront = getDefaultCover(category, "front");
  const defaultBack = getDefaultCover(category, "back");
  const [frontCoverId, setFrontCoverId] = useState(defaultFront.id);
  const [backCoverId, setBackCoverId] = useState(defaultBack.id);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const frontCovers = useMemo(
    () => getCoversForProcess(category, "front", localCovers),
    [category, localCovers],
  );
  const backCovers = useMemo(
    () => getCoversForProcess(category, "back", localCovers),
    [category, localCovers],
  );
  const allCovers = useMemo(() => [...frontCovers, ...backCovers], [frontCovers, backCovers]);
  const outputFileName = mainFile ? buildOutputFileName(mainFile.name) : "File Utama_Proses.pdf";
  const selectedFrontCoverId = frontCovers.some((cover) => cover.id === frontCoverId)
    ? frontCoverId
    : defaultFront.id;
  const selectedBackCoverId = backCovers.some((cover) => cover.id === backCoverId)
    ? backCoverId
    : defaultBack.id;

  function handleMainFileChange(file: File | null) {
    setError(null);
    setMessage(null);
    setMainFile(file);

    if (!file) {
      return;
    }

    try {
      validatePdfFileHint(file, PDF_LIMITS.mainFileBytes);
      setMessage(`${file.name} siap diproses menjadi ${buildOutputFileName(file.name)}.`);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "File utama tidak valid.");
    }
  }

  async function handleProcess() {
    setError(null);
    setMessage(null);

    if (!mainFile) {
      setError("Upload File Utama PDF terlebih dahulu.");
      return;
    }

    setIsProcessing(true);

    try {
      validatePdfFileHint(mainFile, PDF_LIMITS.mainFileBytes);

      const frontCover = getCoverById(allCovers, category, "front", selectedFrontCoverId);
      const backCover = getCoverById(allCovers, category, "back", selectedBackCoverId);
      const [frontBytes, mainBytes, backBytes] = await Promise.all([
        getCoverBytes(frontCover),
        mainFile.arrayBuffer(),
        getCoverBytes(backCover),
      ]);
      const mergedBytes = await mergePdfSequence([
        { label: "Cover Depan", bytes: frontBytes },
        { label: "File Utama", bytes: mainBytes },
        { label: "Cover Belakang", bytes: backBytes },
      ]);

      downloadPdf(mergedBytes, outputFileName);
      setMessage(`${outputFileName} berhasil dibuat dan diunduh.`);
    } catch (processError) {
      setError(processError instanceof Error ? processError.message : "Gagal memproses PDF.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="process-panel" aria-labelledby={`${category}-process-title`}>
      <div className="process-copy">
        <p className="eyebrow">Workflow {CATEGORY_LABELS[category]}</p>
        <h2 id={`${category}-process-title`}>{CATEGORY_LABELS[category]}</h2>
        <p>{description}</p>
      </div>

      <div className="process-grid">
        <label className="field">
          <span>Pilih Cover Depan</span>
          <select
            value={selectedFrontCoverId}
            onChange={(event) => setFrontCoverId(event.target.value)}
          >
            {frontCovers.map((cover) => (
              <option key={cover.id} value={cover.id}>
                {cover.name} - {cover.source === "default" ? "Default" : "Local"}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Pilih Cover Belakang</span>
          <select
            value={selectedBackCoverId}
            onChange={(event) => setBackCoverId(event.target.value)}
          >
            {backCovers.map((cover) => (
              <option key={cover.id} value={cover.id}>
                {cover.name} - {cover.source === "default" ? "Default" : "Local"}
              </option>
            ))}
          </select>
        </label>

        <label className="field file-field process-file">
          <span>File Utama</span>
          <input
            accept="application/pdf,.pdf"
            type="file"
            onChange={(event) => handleMainFileChange(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="output-row">
        <div className="output-name">
          <FileCheck2 aria-hidden="true" size={20} />
          <div>
            <span>Nama output</span>
            <code>{outputFileName}</code>
            {mainFile ? <small>{formatFileSize(mainFile.size)}</small> : null}
          </div>
        </div>
        <button className="primary-button process-button" disabled={isProcessing} onClick={handleProcess}>
          <Download aria-hidden="true" size={18} />
          {isProcessing ? "Memproses" : "Proses"}
        </button>
      </div>

      <div className="privacy-note">
        <ShieldCheck aria-hidden="true" size={18} />
        <span>File diproses di browser ini. Tidak ada upload PDF ke server.</span>
      </div>

      {error ? (
        <p className="form-alert form-alert-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="form-alert form-alert-success" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
