import { test, expect } from '@playwright/test';

const pageErrors: string[] = [];
test.beforeEach(async ({ page }) => {
  pageErrors.length = 0;
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('./');
});
test.afterEach(() => {
  expect(pageErrors).toEqual([]);
});

test('load, geometry, material and visual scale remain consistent', async ({ page }, info) => {
  if (info.project.name !== 'webkit') {
    await expect(page.locator('canvas')).toHaveAttribute('data-scene-ready', 'true');
    await page.getByRole('button', { name: 'Side view', exact: true }).click();
    await page.getByRole('button', { name: 'Side view', exact: true }).click();
    await page.getByRole('button', { name: 'Isometric view', exact: true }).click();
    await expect(page.locator('canvas')).toHaveAttribute('data-scene-ready', 'true');
  }
  await expect(page.getByTestId('result-stress')).toHaveText(/129.84/);
  await page.getByLabel('Applied load (N)', { exact: true }).fill('1000');
  await expect(page.getByTestId('result-stress')).toHaveText(/259.68/);
  await page.getByLabel('Material', { exact: true }).selectOption('steel953');
  await expect(page.getByTestId('result-displacement')).toHaveText(/2.597/);
  await page.getByLabel('Deformation scale', { exact: true }).focus();
  await page.keyboard.press('End');
  await expect(page.getByTestId('deformation-label')).toContainText('30');
  await expect(page.getByTestId('result-displacement')).toHaveText(/2.597/);
  await page.getByRole('button', { name: 'Undeformed view' }).click();
  await expect(page.getByTestId('deformation-label')).toContainText('Undeformed');
  await page.getByLabel('Wall thickness (mm)', { exact: true }).fill('15');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByTestId('result-stress')).toHaveCount(0);
  await page.getByLabel('Wall thickness (mm)', { exact: true }).fill('2');
  await expect(page.getByTestId('result-stress')).toHaveText(/259.68/);
});

test('prediction, FMEA and local persistence work by keyboard', async ({ page }) => {
  await page.getByRole('tab', { name: 'Explore', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Learn', exact: true })).toBeFocused();
  await expect(page.getByTestId('result-stress')).toContainText('Hidden until reveal');
  await expect(page.getByRole('button', { name: 'Reveal result' })).toBeDisabled();
  await page.getByRole('radio', { name: 'Clamp boundary', exact: true }).check();
  await page.getByRole('button', { name: 'Reveal result' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('result-stress')).toContainText('129.84');
  await page.getByRole('tab', { name: 'Learn', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('table', { name: /simplified educational design FMEA/ }).getByRole('row'),
  ).toHaveCount(6);
  await page.getByLabel('Applied load (N)', { exact: true }).fill('750');
  await page.reload();
  await expect(page.getByLabel('Applied load (N)', { exact: true })).toHaveValue('750');
  await expect(page.getByRole('tab', { name: 'Failure Analysis' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

test('built application works without external services and at narrow width', async ({ page }) => {
  const external: string[] = [];
  const expectedOrigin = new URL(page.url()).origin;
  await page.routeWebSocket('**/*', (socket) => {
    external.push(socket.url());
    return socket.close();
  });
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== expectedOrigin && url.protocol !== 'data:' && url.protocol !== 'blob:') {
      external.push(url.href);
      return route.abort();
    }
    return route.continue();
  });
  await page.reload();
  await expect(page.getByTestId('result-displacement')).toHaveText(/3.802/);
  await page.getByLabel('Applied load (N)', { exact: true }).fill('1000');
  await expect(page.getByTestId('result-stress')).toHaveText(/259.68/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel('Applied load (N)', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await page.getByRole('tab', { name: 'Failure Analysis' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  expect(external).toEqual([]);
});
