import { PDFDocument } from "pdf-lib";

import { validatePdfBytes } from "./validate";

export type PdfMergeInput = {
  label: string;
  bytes: ArrayBuffer | Uint8Array;
};

export async function mergePdfSequence(inputs: PdfMergeInput[]) {
  if (inputs.length < 2) {
    throw new Error("At least two PDFs are required.");
  }

  const output = await PDFDocument.create();

  for (const input of inputs) {
    await validatePdfBytes(input.bytes);
    const source = await PDFDocument.load(input.bytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
    const copiedPages = await output.copyPages(source, source.getPageIndices());

    for (const page of copiedPages) {
      output.addPage(page);
    }
  }

  return output.save({
    addDefaultPage: false,
    updateFieldAppearances: false,
    useObjectStreams: true,
  });
}
