export type CoverCategory = "presentation" | "document" | "canva";

export type CoverRole = "front" | "back";

export type CoverSource = "default" | "local";

export type CoverStockItem = {
  id: string;
  role: CoverRole;
  category: CoverCategory;
  source: CoverSource;
  name: string;
  fileName: string;
  size: number;
  createdAt?: string;
  publicPath?: string;
  blob?: Blob;
};

export type LocalCoverRecord = {
  id: string;
  role: CoverRole;
  category: CoverCategory;
  source: "local";
  name: string;
  fileName: string;
  size: number;
  createdAt: string;
  blob: Blob;
};

export type ProcessCategory = {
  id: CoverCategory;
  label: string;
  description: string;
};

export type PdfValidationResult = {
  pageCount: number;
  byteLength: number;
};
