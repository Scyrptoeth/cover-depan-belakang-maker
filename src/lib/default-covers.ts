import type { CoverCategory, CoverRole, CoverStockItem, ProcessCategory } from "@/types/cover-maker";

export const PROCESS_CATEGORIES: ProcessCategory[] = [
  {
    id: "presentation",
    label: "Presentasi",
    description: "Untuk PDF yang berasal dari materi slide atau dokumen presentasi.",
  },
  {
    id: "document",
    label: "Dokumen",
    description: "Untuk PDF yang berasal dari Word, laporan, modul, atau dokumen naskah.",
  },
  {
    id: "canva",
    label: "Canva",
    description: "Untuk PDF yang berasal dari hasil desain atau ekspor Canva.",
  },
];

export const CATEGORY_LABELS: Record<CoverCategory, string> = {
  presentation: "Presentasi",
  document: "Dokumen",
  canva: "Canva",
};

export const ROLE_LABELS: Record<CoverRole, string> = {
  front: "Cover Depan",
  back: "Cover Belakang",
};

export const DEFAULT_COVERS: CoverStockItem[] = [
  {
    id: "default-presentation-front",
    role: "front",
    category: "presentation",
    source: "default",
    name: "Cover Depan Presentasi",
    fileName: "01-Sisipan-Presentasi-Halaman-Paling-Awal.pdf",
    size: 718_221,
    publicPath: "/covers/01-Sisipan-Presentasi-Halaman-Paling-Awal.pdf",
  },
  {
    id: "default-presentation-back",
    role: "back",
    category: "presentation",
    source: "default",
    name: "Cover Belakang Presentasi",
    fileName: "02-Sisipan-Presentasi-Halaman-Paling-Akhir.pdf",
    size: 281_741,
    publicPath: "/covers/02-Sisipan-Presentasi-Halaman-Paling-Akhir.pdf",
  },
  {
    id: "default-document-front",
    role: "front",
    category: "document",
    source: "default",
    name: "Cover Depan Dokumen",
    fileName: "03-Sisipan-Dokumen-Halaman-Paling-Awal.pdf",
    size: 1_216_956,
    publicPath: "/covers/03-Sisipan-Dokumen-Halaman-Paling-Awal.pdf",
  },
  {
    id: "default-document-back",
    role: "back",
    category: "document",
    source: "default",
    name: "Cover Belakang Dokumen",
    fileName: "04-Sisipan-Dokumen-Halaman-Paling-Akhir.pdf",
    size: 172_093,
    publicPath: "/covers/04-Sisipan-Dokumen-Halaman-Paling-Akhir.pdf",
  },
  {
    id: "default-canva-front",
    role: "front",
    category: "canva",
    source: "default",
    name: "Cover Depan Canva",
    fileName: "05-Sisipan-Canva-Halaman-Paling-Awal.pdf",
    size: 463_214,
    publicPath: "/covers/05-Sisipan-Canva-Halaman-Paling-Awal.pdf",
  },
  {
    id: "default-canva-back",
    role: "back",
    category: "canva",
    source: "default",
    name: "Cover Belakang Canva",
    fileName: "06-Sisipan-Canva-Halaman-Paling-Akhir.pdf",
    size: 225_255,
    publicPath: "/covers/06-Sisipan-Canva-Halaman-Paling-Akhir.pdf",
  },
];

export function getDefaultCover(category: CoverCategory, role: CoverRole) {
  const cover = DEFAULT_COVERS.find((item) => item.category === category && item.role === role);

  if (!cover) {
    throw new Error(`Missing default ${role} cover for ${category}`);
  }

  return cover;
}

export function getCoversByRole(role: CoverRole, localCovers: CoverStockItem[] = []) {
  return [...DEFAULT_COVERS, ...localCovers].filter((cover) => cover.role === role);
}

export function getCoversForProcess(
  category: CoverCategory,
  role: CoverRole,
  localCovers: CoverStockItem[] = [],
) {
  return getCoversByRole(role, localCovers).filter((cover) => cover.category === category);
}
