const { test, expect } = require('@playwright/test');
const path = require('path');

const STUDENT_FILE = process.env.STUDENT_FILE;

test.beforeAll(() => {
  if (!STUDENT_FILE)
    throw new Error('STUDENT_FILE 環境変数が設定されていません');
});

function resolveFileUrl() {
  return `file://${path.resolve(__dirname, '..', STUDENT_FILE)}`;
}

// 空白のゆらぎ（余分なスペース等）だけは許容して比較する
function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// CDN（Babel / esm.sh）の読み込みと React の描画を待つ
async function gotoAndWaitRender(page) {
  await page.goto(resolveFileUrl());
  await page.waitForSelector('.tab-food-btn', { timeout: 30000 });
  await page.waitForSelector('.tab-drink-btn', { timeout: 30000 });
  await page.waitForSelector('.recommend-title', { timeout: 30000 });
  await page.waitForSelector('.recommend-desc', { timeout: 30000 });
}

test('初期表示で2つのタブボタンとおすすめ表示が描画される', async ({
  page,
}) => {
  await gotoAndWaitRender(page);
  await expect(page.locator('.tab-food-btn')).toHaveCount(1);
  await expect(page.locator('.tab-drink-btn')).toHaveCount(1);
  await expect(page.locator('.recommend-title')).toHaveCount(1);
  await expect(page.locator('.recommend-desc')).toHaveCount(1);
  expect(normalize(await page.locator('.recommend-title').textContent())).toBe(
    'おすすめ: 焼きたてクロワッサン 🥐',
  );
  expect(normalize(await page.locator('.recommend-desc').textContent())).toBe(
    'サクサク食感で朝にぴったり。',
  );
});

test('タブボタンで食べ物と飲み物を切り替え表示できる', async ({ page }) => {
  await gotoAndWaitRender(page);
  const title = page.locator('.recommend-title');
  const desc = page.locator('.recommend-desc');
  const foodBtn = page.locator('.tab-food-btn');
  const drinkBtn = page.locator('.tab-drink-btn');

  expect(normalize(await title.textContent())).toBe(
    'おすすめ: 焼きたてクロワッサン 🥐',
  );
  expect(normalize(await desc.textContent())).toBe(
    'サクサク食感で朝にぴったり。',
  );

  await drinkBtn.click();
  expect(normalize(await title.textContent())).toBe(
    'おすすめ: ハニーカフェラテ ☕',
  );
  expect(normalize(await desc.textContent())).toBe(
    'はちみつの甘さでほっと一息。',
  );

  await foodBtn.click();
  expect(normalize(await title.textContent())).toBe(
    'おすすめ: 焼きたてクロワッサン 🥐',
  );
  expect(normalize(await desc.textContent())).toBe(
    'サクサク食感で朝にぴったり。',
  );
});

test('useState を使って実装している', async ({ page }) => {
  await gotoAndWaitRender(page);
  const html = await page.content();
  expect(/useState\s*\(/.test(html)).toBeTruthy();
});
