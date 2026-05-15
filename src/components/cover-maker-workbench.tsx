"use client";

import { BookOpen, FileArchive, FileText, Layers3, PanelTop, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CoverStockManager } from "@/components/cover-stock-manager";
import { ProcessPanel } from "@/components/process-panel";
import { PROCESS_CATEGORIES } from "@/lib/default-covers";
import { getLocalCovers } from "@/lib/storage/covers";
import type { CoverCategory, CoverStockItem } from "@/types/cover-maker";

type TabId = "front-stock" | "back-stock" | CoverCategory;

const tabs: Array<{
  id: TabId;
  label: string;
  icon: typeof Layers3;
}> = [
  { id: "front-stock", label: "Stok Cover Depan", icon: PanelTop },
  { id: "back-stock", label: "Stok Cover Belakang", icon: FileArchive },
  { id: "presentation", label: "Presentasi", icon: Layers3 },
  { id: "document", label: "Dokumen", icon: FileText },
  { id: "canva", label: "Canva", icon: BookOpen },
];

function isProcessTab(tab: TabId): tab is CoverCategory {
  return tab === "presentation" || tab === "document" || tab === "canva";
}

export function CoverMakerWorkbench() {
  const [activeTab, setActiveTab] = useState<TabId>("front-stock");
  const [localCovers, setLocalCovers] = useState<CoverStockItem[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  const activeIndex = useMemo(
    () => tabs.findIndex((tab) => tab.id === activeTab),
    [activeTab],
  );

  useEffect(() => {
    let mounted = true;

    getLocalCovers()
      .then((covers) => {
        if (mounted) {
          setLocalCovers(covers);
        }
      })
      .catch((error) => {
        if (mounted) {
          setStorageError(
            error instanceof Error
              ? error.message
              : "Stok lokal tidak dapat dibaca di browser ini.",
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
      return;
    }

    event.preventDefault();

    let nextIndex = index;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    }

    if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    setActiveTab(tabs[nextIndex].id);
    document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus();
  }

  return (
    <section className="workbench" aria-label="Cover Depan-Belakang Maker">
      <div className="workbench-top">
        <div>
          <p className="eyebrow">PDF workbench</p>
          <h1>Cover Depan-Belakang Maker</h1>
          <p>
            Sisipkan cover depan dan cover belakang ke PDF presentasi, dokumen, atau Canva
            tanpa mengirim file ke server.
          </p>
        </div>
        <div className="trust-box" aria-label="Privasi aplikasi">
          <Shield aria-hidden="true" size={24} />
          <span>Browser-only</span>
          <strong>Privasi lokal</strong>
        </div>
      </div>

      {storageError ? (
        <p className="form-alert form-alert-error" role="alert">
          {storageError}
        </p>
      ) : null}

      <div className="tab-shell">
        <div className="tab-list" role="tablist" aria-label="Mode kerja">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const selected = tab.id === activeTab;

            return (
              <button
                aria-controls={selected ? `panel-${tab.id}` : undefined}
                aria-selected={selected}
                className="tab-button"
                id={`tab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                role="tab"
                tabIndex={selected ? 0 : -1}
                type="button"
              >
                <Icon aria-hidden="true" size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div
          aria-labelledby={`tab-${activeTab}`}
          className="tab-panel"
          id={`panel-${activeTab}`}
          role="tabpanel"
          tabIndex={0}
        >
          {activeTab === "front-stock" ? (
            <CoverStockManager
              role="front"
              localCovers={localCovers}
              onLocalCoversChange={setLocalCovers}
            />
          ) : null}

          {activeTab === "back-stock" ? (
            <CoverStockManager
              role="back"
              localCovers={localCovers}
              onLocalCoversChange={setLocalCovers}
            />
          ) : null}

          {isProcessTab(activeTab) ? (
            <ProcessPanel
              category={activeTab}
              description={
                PROCESS_CATEGORIES.find((category) => category.id === activeTab)?.description ?? ""
              }
              localCovers={localCovers}
            />
          ) : null}
        </div>
      </div>

      <div className="status-rail" aria-label="Ringkasan fitur">
        <span>5 tab kerja</span>
        <span>Default cover siap pakai</span>
        <span>IndexedDB untuk stok lokal</span>
        <span>Output _Proses.pdf</span>
        <span>Tanpa backend file upload</span>
      </div>

      <p className="sr-only" aria-live="polite">
        Tab aktif nomor {activeIndex + 1} dari {tabs.length}.
      </p>
    </section>
  );
}
