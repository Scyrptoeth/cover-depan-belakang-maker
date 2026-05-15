import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { mergePdfSequence } from "./merge";
import { hasPdfSignature, validatePdfBytes } from "./validate";

async function createPdf(label: string, pages: Array<[number, number]>) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);

  for (const [width, height] of pages) {
    const page = document.addPage([width, height]);
    page.drawText(label, {
      x: 24,
      y: height - 48,
      size: 18,
      font,
    });
  }

  return document.save();
}

describe("PDF validation and merge", () => {
  it("checks the PDF signature before parsing", async () => {
    const valid = await createPdf("valid", [[300, 400]]);

    expect(hasPdfSignature(valid)).toBe(true);
    await expect(validatePdfBytes(new TextEncoder().encode("not a pdf"))).rejects.toThrow(
      /signature PDF/i,
    );
  });

  it("merges all pages in front-main-back order while keeping page sizes", async () => {
    const front = await createPdf("front", [[300, 400]]);
    const main = await createPdf("main", [
      [500, 600],
      [700, 800],
    ]);
    const back = await createPdf("back", [[320, 420]]);
    const mergedBytes = await mergePdfSequence([
      { label: "front", bytes: front },
      { label: "main", bytes: main },
      { label: "back", bytes: back },
    ]);
    const merged = await PDFDocument.load(mergedBytes);

    expect(merged.getPageCount()).toBe(4);
    expect(merged.getPage(0).getSize()).toEqual({ width: 300, height: 400 });
    expect(merged.getPage(1).getSize()).toEqual({ width: 500, height: 600 });
    expect(merged.getPage(2).getSize()).toEqual({ width: 700, height: 800 });
    expect(merged.getPage(3).getSize()).toEqual({ width: 320, height: 420 });
  });
});
