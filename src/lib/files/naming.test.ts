import { describe, expect, it } from "vitest";

import { buildOutputFileName, sanitizeVisibleFileName } from "./naming";

describe("buildOutputFileName", () => {
  it("adds _Proses before the pdf extension", () => {
    expect(buildOutputFileName("04. Lecture Note.pdf")).toBe("04. Lecture Note_Proses.pdf");
  });

  it("handles uppercase PDF extensions", () => {
    expect(buildOutputFileName("Materi.PDF")).toBe("Materi_Proses.pdf");
  });

  it("adds a pdf extension when the original name does not include one", () => {
    expect(buildOutputFileName("Lecture Note")).toBe("Lecture Note_Proses.pdf");
  });

  it("sanitizes path separators without removing readable words", () => {
    expect(sanitizeVisibleFileName("../Lecture:Note.pdf")).toBe("..-Lecture-Note.pdf");
  });
});
