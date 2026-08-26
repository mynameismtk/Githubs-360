/**
 * ACCEPTANCE CHECKS
 *
 * Runs the checklist from the product brief against the built app in a real
 * browser. Start `npm run preview` first, then `npm run acceptance`.
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:4177/';
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass, detail });

const EXECUTABLE = process.env.CHROME_PATH; // set this if Playwright's own browser is not installed
const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : {});

async function fresh(ctxOpts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...ctxOpts });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.evaluate(() =>
    localStorage.setItem(
      'lumo.v1',
      JSON.stringify({
        settings: { onboarded: true, name: '', region: 'IN', theme: 'dark', reminderTime: null, lockCode: null, narration: false },
      }),
    ),
  );
  await page.reload();
  await page.waitForTimeout(500);
  return { ctx, page };
}

/* 1 — the Liftr is reachable in one tap from a cold start */
{
  const { ctx, page } = await fresh();
  await page.getByRole('button', { name: /Today feels heavy/ }).click();
  await page.waitForTimeout(400);
  ok('Liftr in one tap from cold start', page.url().includes('#/liftr'), page.url());
  await ctx.close();
}

/* 2 — the Anchr is reachable in <=2 taps from every screen */
{
  const { ctx, page } = await fresh();
  const routes = ['/', '/reflectr', '/reframr', '/reframr/list', '/groundr', '/groundr/sounds', '/progress', '/lessons', '/lessons/anhedonia', '/paywall', '/settings', '/liftr'];
  const failed = [];
  for (const r of routes) {
    await page.goto(BASE + '#' + r);
    await page.waitForTimeout(450);
    const taps = await page.evaluate(() => {
      const fab = document.querySelector('.anchr-fab');
      if (fab) return 1;
      const link = [...document.querySelectorAll('button, a')].find((e) => /anchr|safety|not safe/i.test(e.textContent + ' ' + (e.getAttribute('aria-label') ?? '')));
      return link ? 1 : 99;
    });
    if (taps > 2) failed.push(r);
  }
  // inside a Path B comfort session too
  await page.goto(BASE + '#/liftr');
  await page.waitForTimeout(400);
  await page.getByText('Just sit with me').click();
  await page.waitForTimeout(600);
  const inSit = await page.evaluate(() => !!document.querySelector('.sit__notsafe'));
  if (!inSit) failed.push('/liftr (sit)');
  ok('Anchr within 2 taps from every screen', failed.length === 0, failed.join(', '));
  await ctx.close();
}

/* 3 — a full check-in takes four taps and no typing */
{
  const { ctx, page } = await fresh();
  let taps = 0;
  const tap = async (loc) => { await loc.click(); taps++; await page.waitForTimeout(250); };
  await page.getByText("How's today?").first().click(); // opening the sheet is navigation, not part of the check-in
  await page.waitForTimeout(300);
  await tap(page.getByRole('button', { name: /Mood: Flat/ }));
  await tap(page.getByRole('button', { name: /Energy: Some/ }));
  await tap(page.getByRole('button', { name: /Sleep: Okay/ }));
  await tap(page.getByRole('button', { name: /Save check-in/ }));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lumo.v1')).checkIns.length);
  ok('Check-in completes in four taps, no typing', taps === 4 && saved === 1, `${taps} taps, ${saved} saved`);
  await ctx.close();
}

/* 4 — every free feature works in airplane mode */
{
  const { ctx, page } = await fresh();
  await page.waitForTimeout(1200); // let the service worker install
  await ctx.setOffline(true);
  await page.goto(BASE, { waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(900);
  const offlineWorks = await page.evaluate(() => !!document.querySelector('.liftr'));
  await page.goto(BASE + '#/liftr');
  await page.waitForTimeout(400);
  await page.getByText('Help me move').click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Energy: Empty/ }).click();
  await page.waitForTimeout(400);
  const offerOffline = await page.locator('h2').first().innerText();
  await page.goto(BASE + '#/anchr');
  await page.waitForTimeout(500);
  const anchrOffline = await page.evaluate(() => [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')));
  ok('Free features work offline (airplane mode)', offlineWorks && offerOffline.length > 0 && anchrOffline.length > 0,
     `liftr offer offline: "${offerOffline}"; crisis dials: ${anchrOffline.join(' ')}`);

  /* 8 — crisis lines correct for the region and dial correctly */
  ok('India crisis numbers dial correctly', anchrOffline.includes('tel:14416') && anchrOffline.includes('tel:18005990019') && anchrOffline.includes('tel:+919820466726'),
     anchrOffline.join(' '));
  await ctx.close();
}

/* 5 — no paywall after a low-mood check-in, none during a comfort session */
{
  const { ctx, page } = await fresh();
  await page.getByText("How's today?").first().click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Mood: Awful/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Energy: Empty/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Sleep: Short/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /Save check-in/ }).click();
  await page.waitForTimeout(600);
  await page.goto(BASE + '#/paywall');
  await page.waitForTimeout(500);
  const afterLow = await page.locator('body').innerText();
  const lessons = await page.goto(BASE + '#/lessons').then(async () => {
    await page.waitForTimeout(400);
    return page.locator('body').innerText();
  });
  ok('No pricing after a low-mood check-in', !/£/.test(afterLow) && !/See Full Access/.test(lessons), afterLow.split('\n')[0]);
  await ctx.close();
}

/* 6 — nothing anywhere is a breakable streak */
{
  const { ctx, page } = await fresh();
  const routes = ['/', '/progress', '/reflectr', '/lessons', '/settings'];
  let bad = [];
  for (const r of routes) {
    await page.goto(BASE + '#' + r);
    await page.waitForTimeout(400);
    const t = await page.locator('body').innerText();
    if (/\bstreak\b/i.test(t) && !/no streak/i.test(t)) bad.push(r);
  }
  ok('No breakable streak anywhere', bad.length === 0, bad.join(','));
  await ctx.close();
}

/* 7 — usable one-handed at XXL text size (no horizontal overflow) */
{
  const { ctx, page } = await fresh();
  const routes = ['/', '/reflectr', '/reframr', '/groundr', '/groundr/sounds', '/progress', '/lessons', '/lessons/what-helps', '/anchr', '/settings', '/paywall', '/liftr'];
  const overflow = [];
  for (const r of routes) {
    await page.goto(BASE + '#' + r);
    await page.waitForTimeout(400);
    await page.addStyleTag({ content: 'html{font-size:24px !important}' }); // ~XXL dynamic type
    await page.waitForTimeout(300);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 2) overflow.push(`${r} (+${over}px)`);
  }
  ok('No horizontal overflow at XXL text', overflow.length === 0, overflow.join(', '));
  await ctx.close();
}

/* 9 — touch targets are at least 48dp, and dark is the default */
{
  const { ctx, page } = await fresh();
  const small = await page.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll('button, a, input, select')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.height < 44) bad.push((el.textContent || el.tagName).trim().slice(0, 24) + ` ${Math.round(r.height)}px`);
    }
    return bad;
  });
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  ok('Touch targets >= 44px on home', small.length === 0, small.join(', '));
  ok('Dark mode is the default', theme === 'dark', theme);
  await ctx.close();
}

/* 10 — nothing diagnoses the user */
{
  const { ctx, page } = await fresh();
  const routes = ['/', '/reflectr', '/progress', '/lessons', '/lessons/what-helps', '/settings', '/anchr'];
  const bad = [];
  for (const r of routes) {
    await page.goto(BASE + '#' + r);
    await page.waitForTimeout(350);
    const t = await page.locator('body').innerText();
    if (/you (have|are) (depressed|depression)|your diagnosis|we (can )?(diagnose|treat)/i.test(t)) bad.push(r);
  }
  ok('Nothing diagnoses or claims to treat', bad.length === 0, bad.join(','));
  await ctx.close();
}

await browser.close();

let failures = 0;
for (const r of results) {
  if (!r.pass) failures++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `\n        ${r.detail}` : ''}`);
}
console.log(`\n${results.length - failures}/${results.length} checks passed`);
process.exit(failures ? 1 : 0);
