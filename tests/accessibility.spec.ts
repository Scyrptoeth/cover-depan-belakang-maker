import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const tabs = ["Stok Cover Depan", "Stok Cover Belakang", "Presentasi", "Dokumen", "Canva"];

for (const tab of tabs) {
  test(`${tab} tab has no serious accessibility violations`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: tab }).click();

    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? ""),
    );

    expect(seriousViolations).toEqual([]);
  });
}
