import { describe, expect, it } from "vitest";

import { DEFAULT_COVERS, getDefaultCover, PROCESS_CATEGORIES } from "./default-covers";

describe("default cover map", () => {
  it("contains front and back defaults for each process category", () => {
    for (const category of PROCESS_CATEGORIES) {
      expect(getDefaultCover(category.id, "front").source).toBe("default");
      expect(getDefaultCover(category.id, "back").source).toBe("default");
    }
  });

  it("maps exactly six bundled PDFs", () => {
    expect(DEFAULT_COVERS).toHaveLength(6);
    expect(DEFAULT_COVERS.map((cover) => cover.fileName)).toEqual([
      "01-Sisipan-Presentasi-Halaman-Paling-Awal.pdf",
      "02-Sisipan-Presentasi-Halaman-Paling-Akhir.pdf",
      "03-Sisipan-Dokumen-Halaman-Paling-Awal.pdf",
      "04-Sisipan-Dokumen-Halaman-Paling-Akhir.pdf",
      "05-Sisipan-Canva-Halaman-Paling-Awal.pdf",
      "06-Sisipan-Canva-Halaman-Paling-Akhir.pdf",
    ]);
  });
});
