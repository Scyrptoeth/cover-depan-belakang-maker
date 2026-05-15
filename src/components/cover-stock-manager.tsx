"use client";

import { Eye, FilePlus2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { CATEGORY_LABELS, DEFAULT_COVERS, ROLE_LABELS } from "@/lib/default-covers";
import { formatFileSize } from "@/lib/files/naming";
import { PDF_LIMITS, readAndValidatePdfFile } from "@/lib/pdf/validate";
import { deleteLocalCover, saveLocalCover } from "@/lib/storage/covers";
import type { CoverCategory, CoverRole, CoverStockItem } from "@/types/cover-maker";

type CoverStockManagerProps = {
  role: CoverRole;
  localCovers: CoverStockItem[];
  onLocalCoversChange: (covers: CoverStockItem[]) => void;
};

const categoryOptions: CoverCategory[] = ["presentation", "document", "canva"];

function openCoverPreview(cover: CoverStockItem) {
  if (cover.publicPath) {
    window.open(cover.publicPath, "_blank", "noopener,noreferrer");
    return;
  }

  if (!cover.blob) {
    return;
  }

  const url = URL.createObjectURL(cover.blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function CoverStockManager({
  role,
  localCovers,
  onLocalCoversChange,
}: CoverStockManagerProps) {
  const [category, setCategory] = useState<CoverCategory>("presentation");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const covers = useMemo(
    () => [...DEFAULT_COVERS, ...localCovers].filter((cover) => cover.role === role),
    [localCovers, role],
  );

  async function handleSaveCover() {
    setError(null);
    setMessage(null);

    if (!selectedFile) {
      setError("Pilih file PDF cover terlebih dahulu.");
      return;
    }

    setIsSaving(true);

    try {
      await readAndValidatePdfFile(selectedFile, PDF_LIMITS.coverFileBytes);
      const saved = await saveLocalCover({
        role,
        category,
        file: selectedFile,
      });
      onLocalCoversChange([saved, ...localCovers]);
      setSelectedFile(null);
      setMessage(`${selectedFile.name} tersimpan sebagai stok lokal.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan cover lokal.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteCover(cover: CoverStockItem) {
    if (cover.source !== "local") {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await deleteLocalCover(cover.id);
      onLocalCoversChange(localCovers.filter((item) => item.id !== cover.id));
      setMessage(`${cover.fileName} dihapus dari stok lokal.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Gagal menghapus cover lokal.");
    }
  }

  async function handleClearLocalCovers() {
    const localCount = localCovers.filter((cover) => cover.role === role).length;

    if (localCount === 0) {
      setMessage(`Belum ada ${ROLE_LABELS[role].toLowerCase()} lokal untuk dihapus.`);
      return;
    }

    const confirmed = window.confirm(
      `Hapus semua ${ROLE_LABELS[role].toLowerCase()} lokal? Cover default tidak ikut dihapus.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const otherRoleCovers = localCovers.filter((cover) => cover.role !== role);

      for (const cover of localCovers.filter((item) => item.role === role)) {
        await deleteLocalCover(cover.id);
      }

      onLocalCoversChange(otherRoleCovers);
      setMessage(`Semua ${ROLE_LABELS[role].toLowerCase()} lokal sudah dihapus.`);
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "Gagal menghapus stok lokal.");
    }
  }

  return (
    <section className="stock-panel" aria-labelledby={`${role}-stock-title`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Stok {ROLE_LABELS[role]}</p>
          <h2 id={`${role}-stock-title`}>{ROLE_LABELS[role]}</h2>
        </div>
        <span className="privacy-chip">Lokal di perangkat</span>
      </div>

      <div className="upload-strip" aria-label={`Upload ${ROLE_LABELS[role]} lokal`}>
        <label className="field">
          <span>Kategori cover</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as CoverCategory)}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {CATEGORY_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <label className="field file-field">
          <span>File PDF cover</span>
          <input
            key={selectedFile?.name ?? "empty-cover-input"}
            accept="application/pdf,.pdf"
            type="file"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <button className="primary-button upload-button" disabled={isSaving} onClick={handleSaveCover}>
          <FilePlus2 aria-hidden="true" size={18} />
          {isSaving ? "Menyimpan" : "Tambah"}
        </button>
      </div>

      <div className="stock-toolbar">
        <p>Cover lokal tersimpan di IndexedDB browser ini sampai Anda menghapusnya.</p>
        <button className="secondary-button" type="button" onClick={handleClearLocalCovers}>
          <Trash2 aria-hidden="true" size={18} />
          Hapus cover lokal
        </button>
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

      <div className="stock-list" aria-label={`Daftar ${ROLE_LABELS[role]}`}>
        {covers.map((cover) => (
          <article className="stock-item" key={cover.id}>
            <div className="stock-main">
              <span className={`source-pill source-${cover.source}`}>
                {cover.source === "default" ? "Default" : "Local"}
              </span>
              <h3>{cover.name}</h3>
              <p>{CATEGORY_LABELS[cover.category]}</p>
              <code>{cover.fileName}</code>
            </div>
            <div className="stock-actions">
              <span className="file-size">{formatFileSize(cover.size)}</span>
              <button
                className="icon-button"
                aria-label={`Buka preview ${cover.fileName}`}
                onClick={() => openCoverPreview(cover)}
              >
                <Eye aria-hidden="true" size={18} />
              </button>
              <button
                className="icon-button danger-button"
                aria-label={`Hapus ${cover.fileName}`}
                disabled={cover.source === "default"}
                onClick={() => handleDeleteCover(cover)}
              >
                <Trash2 aria-hidden="true" size={18} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
