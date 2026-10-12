import { chromium, expect } from '@playwright/test';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

// Start the built application with `pnpm preview` before running this script.
const output = fileURLToPath(new URL('../artifacts/screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const externalRequests = [];
const captures = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.routeWebSocket('**/*', (socket) => {
    externalRequests.push(socket.url());
    return socket.close();
  });
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== 'http://127.0.0.1:4179' && !['blob:', 'data:'].includes(url.protocol)) {
      externalRequests.push(url.href);
      return route.abort();
    }
    return route.continue();
  });
  async function capture(name, fullPage = false) {
    // Reset scroll so fixed off-screen controls do not appear in full-page captures.
    if (fullPage) await page.evaluate(() => scrollTo(0, 0));
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    await page.screenshot({ path: `${output}/${name}.png`, fullPage, animations: 'disabled' });
    captures.push({ name: `${name}.png`, viewport: page.viewportSize(), fullPage });
  }
  await page.goto('http://127.0.0.1:4179/');
  await expect(page.locator('canvas')).toHaveAttribute('data-scene-ready', 'true');
  assert.match(await page.getByTestId('result-stress').innerText(), /129.84/);
  // Inspect trends through the production UI, independently of component mocks.
  await page.getByLabel('Exposed length (mm)', { exact: true }).fill('600');
  await expect(page.getByTestId('result-displacement')).toHaveText(/30.416/);
  await page.getByLabel('Exposed length (mm)', { exact: true }).fill('300');
  await page.getByLabel('Outer diameter (mm)', { exact: true }).fill('40');
  await expect(page.getByTestId('result-stress')).toHaveText(/69.42/);
  await expect(page.getByTestId('result-displacement')).toHaveText(/1.525/);
  await page.getByLabel('Outer diameter (mm)', { exact: true }).fill('30');
  await page.getByLabel('Wall thickness (mm)', { exact: true }).fill('1');
  await expect(page.getByTestId('result-stress')).not.toHaveText(/129.84/);
  assert(parseFloat(await page.getByTestId('result-stress').innerText()) > 129.84);
  await page.getByLabel('Wall thickness (mm)', { exact: true }).fill('2');
  await page.getByLabel('Material', { exact: true }).selectOption('titanium32');
  await expect(page.getByTestId('result-displacement')).toHaveText(/2.597/);
  await page.getByLabel('Material', { exact: true }).selectOption('steel953');
  await expect(page.getByTestId('result-displacement')).toHaveText(/1.298/);
  await page.getByLabel('Material', { exact: true }).selectOption('aluminium6061');
  await page.getByLabel('Applied load (N)', { exact: true }).fill('0');
  await expect(page.getByTestId('result-safety')).toHaveText('Unloaded');
  await page.getByLabel('Applied load (N)', { exact: true }).fill('500');
  await expect(page.getByTestId('result-displacement')).toHaveText(/3.802/);
  await capture('desktop-explore');
  await page.getByRole('tab', { name: 'Learn', exact: true }).click();
  assert.match(await page.getByTestId('result-stress').innerText(), /Hidden until reveal/);
  await capture('desktop-prediction', true);
  await page.getByRole('radio', { name: 'Clamp boundary', exact: true }).check();
  await page.getByRole('button', { name: 'Reveal result' }).click();
  await capture('desktop-learn', true);
  await page.getByRole('tab', { name: 'Failure Analysis' }).click();
  await capture('desktop-fmea', true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('tab', { name: 'Explore', exact: true }).click();
  await page.evaluate(() => scrollTo(0, 0));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await capture('mobile-explore', true);
  await page.getByRole('tab', { name: 'Failure Analysis' }).click();
  const tableRegion = page.locator('.table-scroll');
  await tableRegion.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => tableRegion.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await tableRegion.evaluate((el) => {
    el.scrollLeft = 0;
  });
  await capture('mobile-fmea', true);
  const contextLossSupported = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const extension = canvas?.getContext('webgl2')?.getExtension('WEBGL_lose_context');
    if (!extension) return false;
    extension.loseContext();
    return true;
  });
  assert(contextLossSupported, 'Chromium must support native context-loss verification');
  await expect(page.getByRole('heading', { name: '3D view unavailable' })).toBeVisible();
  await expect(page.getByTestId('result-stress')).toHaveText(/129.84/);
  await page.getByRole('button', { name: 'Retry 3D view' }).click();
  await expect(page.locator('canvas')).toHaveAttribute('data-scene-ready', 'true');
  await page.waitForFunction(() => {
    const gl = document.querySelector('canvas')?.getContext('webgl2');
    return gl && !gl.isContextLost();
  });
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  const record = {
    capturedAt: new Date().toISOString(),
    browser: browser.version(),
    captures,
    buildAssets: await readdir(fileURLToPath(new URL('../dist/assets/', import.meta.url))),
    contextLossAndRetryVerified: true,
    narrowFmeaKeyboardScrollVerified: true,
    geometryAndMaterialUITrendsVerified: true,
    pageErrors: errors,
    externalRequests,
    note: 'Automated captures of the production build; visual inspection is recorded separately in the living testing document.',
  };
  await writeFile(`${output}/inspection.json`, JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify(record, null, 2));
} finally {
  await browser.close();
}
