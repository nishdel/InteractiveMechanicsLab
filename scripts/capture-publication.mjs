import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4179/InteractiveMechanicsLab/';
const outDir = path.resolve('docs/screenshots');

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    serviceWorkers: 'block',
  });
  const page = await context.newPage();

  const pageErrors = [];
  const failedAssets = [];
  const consoleErrors = [];

  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', (res) => {
    const url = res.url();
    if (new URL(url).origin === new URL(baseURL).origin && res.status() >= 400) {
      failedAssets.push({ url, status: res.status() });
    }
  });

  try {
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    // State 1: Desktop default
    await page.waitForSelector('canvas[data-scene-ready="true"]', { timeout: 15000 });
    const stressEl = page.locator('[data-testid="result-stress"]');
    await expect(stressEl).toContainText('129.84');
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    await page.screenshot({ path: path.join(outDir, 'desktop.jpg'), type: 'jpeg', quality: 82 });

    // State 2: Higher load + Ti
    await page.getByLabel('Applied load (N)', { exact: true }).fill('1000');
    await page.getByLabel('Material', { exact: true }).selectOption('titanium32');
    await expect(stressEl).toContainText('259.68');
    const dispEl = page.locator('[data-testid="result-displacement"]');
    await expect(dispEl).toContainText('5.194');
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    await page.screenshot({ path: path.join(outDir, 'comparison.jpg'), type: 'jpeg', quality: 82 });

    // State 3: Learn panel
    await page.getByLabel('Applied load (N)', { exact: true }).fill('500');
    await page.getByLabel('Material', { exact: true }).selectOption('aluminium6061');
    await page.getByRole('tab', { name: 'Learn', exact: true }).click();
    await page.getByRole('radio', { name: 'Clamp boundary', exact: true }).check();
    await page.getByRole('button', { name: 'Reveal result', exact: true }).click();
    await expect(stressEl).toContainText('129.84');
    const learnArea = page.locator('.learning-area');
    await expect(learnArea).toBeVisible();
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    await learnArea.screenshot({
      path: path.join(outDir, 'learning.jpg'),
      type: 'jpeg',
      quality: 82,
    });

    // State 4: Mobile
    await page.getByRole('tab', { name: 'Explore', exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    const canvas = page.locator('canvas');
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForSelector('canvas[data-scene-ready="true"]', { timeout: 15000 });
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: path.join(outDir, 'mobile.jpg'),
      type: 'jpeg',
      quality: 82,
      fullPage: true,
    });

    // Validation
    expect(pageErrors, `Page errors: ${pageErrors.join('; ')}`).toEqual([]);
    expect(failedAssets, `Failed assets: ${JSON.stringify(failedAssets)}`).toEqual([]);
    expect(consoleErrors, `Console errors: ${consoleErrors.join('; ')}`).toEqual([]);

    // Private capture evidence; not part of the published screenshots.
    const report = {
      states: ['desktop', 'comparison', 'learning', 'mobile'],
      browserVersion: browser.version(),
      errors: { pageErrors, failedAssets, consoleErrors },
    };
    const reportDir = path.resolve('.omnilab/verification');
    await mkdir(reportDir, { recursive: true });
    await writeFile(
      path.join(reportDir, 'publication-captures.json'),
      JSON.stringify(report, null, 2),
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
