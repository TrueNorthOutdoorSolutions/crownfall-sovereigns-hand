import { expect, test } from '@playwright/test';

test('menu, rules, deployment, AI response, resume, and replay export', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /One Crown/ })).toBeVisible();
  await page.getByRole('button', { name: 'Learn the rules' }).click();
  await expect(page.getByRole('dialog')).toContainText('Two consecutive passes');
  await page.getByRole('button', { name: /ready to command/ }).click();
  await page.getByRole('button', { name: 'Enter the battle' }).click();
  await expect(page.locator('.hand-cards .champion-card')).toHaveCount(5);
  await page.locator('.hand-cards .champion-card').first().click();
  await page.locator('.front-throne .front-action button').click();
  await expect(page.locator('.front-throne .own-row .champion-card')).toHaveCount(1);
  await expect(page.locator('.own-bar')).toContainText('YOUR ACTION');
  await page.getByRole('button', { name: 'Battle journal' }).click();
  await expect(page.locator('.journal')).toContainText('Rival');
  await page.getByRole('button', { name: 'Close journal' }).click();
  const journal = await page.evaluate(() => localStorage.getItem('sovereigns-hand:prototype:v1'));
  await page.reload();
  await page.getByRole('button', { name: /Resume battle/ }).click();
  await expect(page.locator('.front-throne .own-row .champion-card')).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem('sovereigns-hand:prototype:v1'))).toBe(journal);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export deterministic replay' }).click();
  expect((await download).suggestedFilename()).toMatch(/sovereigns-hand-\d+\.json/);
  expect(errors).toEqual([]);
});

test('a complete seeded match uses actual controls, resolves battles, and rematches', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.evaluate(async () => {
    // @ts-expect-error Browser imports are transformed by the Vite development server.
    const { createGame } = await import('/src/game/rules.ts');
    // @ts-expect-error Browser module URL.
    const { serializeGame } = await import('/src/persistence/journal.ts');
    localStorage.setItem('sovereigns-hand:prototype:v1', serializeGame(createGame(19)));
  });
  await page.reload(); await page.getByRole('button', { name: /Resume battle/ }).click();
  let rounds = 0, actions = 0;
  while (actions < 500) {
    const snapshot = await page.evaluate(async () => {
      // @ts-expect-error Browser module URL.
      const { restoreGame } = await import('/src/persistence/journal.ts');
      // @ts-expect-error Browser module URL.
      const { chooseAction } = await import('/src/game/ai.ts');
      const s = restoreGame(localStorage.getItem('sovereigns-hand:prototype:v1')!);
      return { phase: s.phase, active: s.active, history: s.history.length, action: s.phase === 'planning' && s.active === 0 ? chooseAction(s) : null, units: s.units };
    });
    if (snapshot.phase !== 'planning') {
      await page.getByRole('button', { name: 'Skip animation' }).click();
      if (snapshot.phase === 'finished') break;
      await page.getByRole('button', { name: /Begin round/ }).click(); rounds++; continue;
    }
    if (snapshot.active === 1) {
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('sovereigns-hand:prototype:v1')!).actions.length)).toBeGreaterThan(snapshot.history); continue;
    }
    const action = snapshot.action;
    if (action.type === 'deploy') {
      await page.locator('.hand-cards .champion-card').nth(action.handIndex).click();
      await page.locator(`.front-${action.front} .front-action button`).click();
    } else if (action.type === 'ascend') {
      await page.locator('.hand-cards .champion-card').nth(action.handIndex).click();
      const target = snapshot.units.find((u: { uid: number }) => u.uid === action.uid);
      const index = snapshot.units.filter((u: { owner: number; front: string }) => u.owner === 0 && u.front === target.front).findIndex((u: { uid: number }) => u.uid === action.uid);
      await page.locator(`.front-${target.front} .unit-wrapper`).nth(index).getByRole('button', { name: /Ascend/ }).click();
    } else if (action.type === 'move' || action.type === 'equip') {
      const target = snapshot.units.find((u: { uid: number }) => u.uid === action.uid);
      const index = snapshot.units.filter((u: { owner: number; front: string }) => u.owner === 0 && u.front === target.front).findIndex((u: { uid: number }) => u.uid === action.uid);
      await page.locator(`.front-${target.front} .own-row .champion-card`).nth(index).click();
      if (action.type === 'move') await page.locator(`.front-${action.front} .front-action button`).click();
      else await page.getByRole('button', { name: action.item === 'shp-item-blade' ? /Tempered Edge/ : /Forged Aegis/ }).click();
    } else await page.getByRole('button', { name: /Pass action|Pass & resolve/ }).click();
    actions++;
  }
  expect(rounds).toBeGreaterThan(0); expect(actions).toBeLessThan(500);
  await expect(page.getByRole('button', { name: /Rematch/ })).toBeVisible();
  await page.getByRole('button', { name: /Rematch/ }).click();
  await expect(page.locator('.round-indicator b')).toHaveText('01');
  await expect(page.locator('.hand-cards .champion-card')).toHaveCount(5);
  expect(errors).toEqual([]);
});

test('mobile has no page overflow and can deploy into every front', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('button', { name: 'Enter the battle' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.locator('.hand-cards .champion-card').first().click();
  await page.locator('.front-forge .front-action button').click();
  await expect(page.locator('.front-forge .own-row .champion-card')).toHaveCount(1);
});
