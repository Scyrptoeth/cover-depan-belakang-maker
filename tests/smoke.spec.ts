import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts } from "pdf-lib";

async function createMainPdf() {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const page = document.addPage([420, 595]);

  page.drawText("Main PDF", {
    x: 48,
    y: 520,
    size: 24,
    font,
  });

  return Buffer.from(await document.save());
}

test("workbench exposes stock and process tabs", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Cover Depan-Belakang Maker" }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "Stok Cover Depan" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Stok Cover Belakang" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Presentasi" })).toBeVisible();
  await expect(page.getByText("01-Sisipan-Presentasi-Halaman-Paling-Awal.pdf")).toBeVisible();
});

test("presentation flow downloads a processed PDF with the expected filename", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Presentasi" }).click();

  const mainPdfPath = testInfo.outputPath("04. Lecture Note.pdf");
  await testInfo.attach("main-pdf", {
    body: await createMainPdf(),
    contentType: "application/pdf",
  });
  await writeFile(mainPdfPath, await createMainPdf());

  await page.getByLabel("File Utama").setInputFiles(mainPdfPath);
  await expect(page.locator("code", { hasText: "04. Lecture Note_Proses.pdf" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Proses$/ }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("04. Lecture Note_Proses.pdf");
});
