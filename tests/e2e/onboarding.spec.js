// Test E2E de la Iniciación Real dedicada (onboarding.html):
// Verifica la redirección desde el Salón cuando se requiere iniciación,
// la selección interactiva de apodo, género, edad y princesa guía,
// y la firma del pergamino que persiste la identidad y navega a index.html.
import { test, expect } from '@playwright/test';

test.describe('Iniciación Real & Pergamino Mágico', () => {
  test('un aventurero nuevo en index.html es redirigido a onboarding.html', async ({ page }) => {
    // Sin vq-skip-onboarding: simula un niño abriendo la app por primera vez
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/onboarding.html', { timeout: 5000 });
    expect(page.url()).toContain('/onboarding.html');
  });

  test('el formulario de iniciación permite configurar perfil, firmar y jugar', async ({ page }) => {
    await page.goto('/onboarding.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Verificar elementos principales
    const nameInput = page.locator('#onboarding-input-name');
    const submitBtn = page.locator('#btn-onboarding-submit');
    const listenBtn = page.locator('#btn-preview-listen-speech');
    await expect(nameInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
    await expect(listenBtn).toBeVisible();
    await expect(listenBtn.locator('use')).toHaveAttribute('href', '#vq-icon-speech');

    // 2. Probar chip táctil de apodo rápido (Valen)
    const valenChip = page.locator('.onboarding-quick-btn[data-name="Valen"]');
    await valenChip.click();
    await expect(nameInput).toHaveValue('Valen');

    // 3. Probar selección de tratamiento (Exploradora)
    const girlCard = page.locator('.onboarding-gender-card[data-gender="girl"]');
    await girlCard.click();
    await expect(girlCard).toHaveClass(/active/);

    // 4. Probar selección de edad (8 años)
    const age8Bubble = page.locator('.onboarding-age-bubble[data-age="8"]');
    await age8Bubble.click();
    await expect(age8Bubble).toHaveClass(/active/);

    // 5. Probar selección de Princesa Guía (Reni)
    const reniCard = page.locator('.onboarding-companion-card[data-companion="reni"]');
    await reniCard.click();
    await expect(reniCard).toHaveClass(/active/);

    // 6. Verificar actualización del spotlight de bienvenida en vivo
    const previewTag = page.locator('#preview-heroine-tag');
    await expect(previewTag).toContainText('Reni');

    // 7. Firmar pergamino y jugar
    await submitBtn.click();

    // 8. Esperar redirección al Salón Principal (index.html)
    await page.waitForURL('**/index.html', { timeout: 6000 });
    expect(page.url()).toContain('/index.html');

    // 9. Verificar que el Salón Principal muestra el saludo real personalizado
    await page.waitForTimeout(1000);
    const welcomeTitle = page.locator('#journey-welcome-title');
    await expect(welcomeTitle).toBeVisible();
    const welcomeText = await welcomeTitle.innerText();
    expect(welcomeText).toContain('Valen');
  });
});
