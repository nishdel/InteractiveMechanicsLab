import { test, expect } from '@playwright/test';

test.describe('Geometry Controls', () => {
  test('verifies geometry controls and material recovery', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('./');

    // Verify defaults
    await expect(page.getByTestId('result-stress')).toContainText('129.84 MPa');
    await expect(page.getByTestId('result-displacement')).toContainText('3.802 mm');
    await expect(page.getByTestId('result-mass')).toContainText('142.50 g');

    // Change L to 150
    const lengthInput = page.getByLabel('Exposed length (mm)', { exact: true });
    await lengthInput.fill('150');
    await expect(page.getByTestId('result-stress')).toContainText('64.92');
    await expect(page.getByTestId('result-displacement')).toContainText('0.475');
    await expect(page.getByTestId('result-mass')).toContainText('71.25');

    // Restore L300 and Do40
    await lengthInput.fill('300');
    const diameterInput = page.getByLabel('Outer diameter (mm)', { exact: true });
    await diameterInput.fill('40');
    await expect(page.getByTestId('result-stress')).toContainText('69.42');
    await expect(page.getByTestId('result-displacement')).toContainText('1.525');
    await expect(page.getByTestId('result-mass')).toContainText('193.40');

    // Independent N-mm oracle: I = 7472.25*pi mm^4; stress = 95.847601982 MPa.
    // Restore Do30 and t3
    await diameterInput.fill('30');
    const thicknessInput = page.getByLabel('Wall thickness (mm)', { exact: true });
    await thicknessInput.fill('3');
    await expect(page.getByTestId('result-stress')).toContainText('95.85');
    await expect(page.getByTestId('result-displacement')).toContainText('2.807');
    await expect(page.getByTestId('result-mass')).toContainText('206.12');

    // Restore t2 and choose titanium32
    await thicknessInput.fill('2');
    const materialSelect = page.getByLabel('Material', { exact: true });
    await materialSelect.selectOption('titanium32');
    await expect(page.getByTestId('result-stress')).toContainText('129.84');
    await expect(page.getByTestId('result-displacement')).toContainText('2.597');
    await expect(page.getByTestId('result-mass')).toContainText('236.45');

    // Set L0: role alert visible and stress count0
    await lengthInput.fill('0');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByTestId('result-stress')).toHaveCount(0);

    // Restore300 shows129.84
    await lengthInput.fill('300');
    await expect(page.getByTestId('result-stress')).toContainText('129.84');

    // Test error listener collects pageerror strings and expect array empty
    expect(errors).toEqual([]);
  });
});
