import { test, expect } from '@playwright/test';

const sectionCounts = {
  highlights: 4,
  'academic-work': 5,
  publications: 2,
  background: 2,
  'academic-achievements': 7,
  'professional-achievements': 4,
};

async function loadPreviews(page) {
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => {
    image.loading = 'eager';
    return image.decode();
  })));
}

test('preserves all content, evidence previews, and configured destinations', async ({ page }) => {
  const failed = [];
  const errors = [];
  page.on('requestfailed', request => failed.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Nilabro Saha/);
  await expect(page.locator('h1')).toHaveText('Hello, I’m Nilabro.');
  for (const [section, count] of Object.entries(sectionCounts)) {
    await expect(page.locator(`#${section} .project-card`)).toHaveCount(count);
  }
  await expect(page.locator('#highlights h3')).toHaveText([
    'Research & mechanisms.', 'Academics & leadership.', 'Data & performance.', 'Enterprise applications & AI.',
  ]);
  await expect(page.locator('#highlights li')).toHaveCount(14);
  await expect(page.locator('.carousel, .section-rail, [data-carousel]')).toHaveCount(0);
  await expect(page.locator('#academic-work img[src*="seminar-"]')).toHaveCount(2);
  await expect(page.locator('[data-link-key="seminar-wearable-technology"]')).toHaveAttribute('href', 'https://doi.org/10.5281/zenodo.22843036');
  await expect(page.locator('[data-link-key="seminar-compliant-mechanisms"]')).toHaveAttribute('href', 'https://doi.org/10.5281/zenodo.22843178');
  await loadPreviews(page);
  for (const link of await page.locator('.preview-link').all()) {
    await expect(link).toHaveAttribute('href', await link.locator('img').getAttribute('src'));
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAccessibleName(/View full-size preview/);
  }
  await expect(page.locator('#academic-achievements .project-card').last()).toHaveAttribute('aria-label', 'IndianOil Meritorious Academic Performance');
  await expect(page.locator('.preview-link')).toHaveCount(18);
  await expect(page.locator('.media-caption, .card-media figcaption')).toHaveCount(0);
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
});

test('native section links update hashes and support direct loading and browser history', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const link of await page.locator('.site-nav a').all()) {
    const href = await link.getAttribute('href');
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator(href)).toBeInViewport();
  }
  await page.goBack();
  await expect(page).toHaveURL(/#academic-achievements$/);
  await page.goto('/#publications');
  await expect(page.locator('#publications h2')).toBeInViewport();
  await page.locator('.site-footer a').click();
  await expect(page).toHaveURL(/#top$/);
  await expect(page.locator('.site-header')).toBeInViewport();
});

for (const width of [390, 768, 1024, 1440]) {
  test(`responsive page and readable previews at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await loadPreviews(page);
    const expectedColumns = width <= 700 ? 1 : width <= 1000 ? 2 : 3;
    for (const [section, count] of Object.entries(sectionCounts)) {
      const grid = page.locator(`#${section} .card-grid`);
      const columns = await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
      const sectionColumns = ['highlights', 'academic-achievements', 'professional-achievements'].includes(section) && width > 1000 ? 4
        : ['publications', 'background'].includes(section) ? Math.min(2, expectedColumns) : expectedColumns;
      expect(columns).toBe(sectionColumns);
      const bounds = await grid.locator('.project-card').evaluateAll(cards => cards.map(card => {
        const box = card.getBoundingClientRect();
        return { left: box.left, right: box.right, clipped: card.scrollWidth > card.clientWidth + 1 };
      }));
      expect(bounds).toHaveLength(count);
      for (const box of bounds) {
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
        expect(box.clipped).toBe(false);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    for (const image of await page.locator('.card-media img').all()) {
      await expect(image).toHaveCSS('object-fit', 'contain');
    }
    for (const [selector, expectedWidth, expectedHeight] of [
      ['.exoskeleton-preview', 1040, 780], ['.parallel-stage-preview', 637, 430],
    ]) {
      const framing = await page.locator(selector).evaluate(figure => {
        const window = figure.querySelector('.repository-crop').getBoundingClientRect();
        const image = figure.querySelector('img');
        const bounds = image.getBoundingClientRect();
        const preview = figure.querySelector('.preview-link').getBoundingClientRect();
        const scale = bounds.width / image.naturalWidth;
        return {
          x: (window.left - bounds.left) / scale,
          y: (window.top - bounds.top) / scale,
          width: window.width / scale,
          height: window.height / scale,
          scaleDifference: Math.abs(scale - bounds.height / image.naturalHeight),
          inside: window.left >= preview.left - 1 && window.right <= preview.right + 1
            && window.top >= preview.top - 1 && window.bottom <= preview.bottom + 1,
          fill: Math.max(window.width / preview.width, window.height / preview.height),
          displayedWidth: window.width,
        };
      });
      expect(framing.x).toBeCloseTo(36, 0);
      expect(framing.y).toBeCloseTo(36, 0);
      expect(framing.width).toBeCloseTo(expectedWidth, 0);
      expect(framing.height).toBeCloseTo(expectedHeight, 0);
      expect(framing.scaleDifference).toBeLessThan(.0001);
      expect(framing.inside).toBe(true);
      expect(framing.fill).toBeCloseTo(1, 2);
      expect(framing.displayedWidth).toBeGreaterThan(100);
    }
    for (const link of await page.locator('.platform-link').all()) {
      const box = await link.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      const icon = await link.locator('.platform-icon').boundingBox();
      const label = await link.locator('.link-label').boundingBox();
      expect(icon.x + icon.width).toBeLessThan(label.x);
    }
    if (width >= 768) {
      const primary = await page.locator('.hero-actions > .button').boundingBox();
      for (const contact of await page.locator('.hero-actions #contact a').all()) {
        const box = await contact.boundingBox();
        expect(Math.abs(box.y + box.height / 2 - primary.y - primary.height / 2)).toBeLessThan(2);
      }
    }
    for (const preview of await page.locator('.preview-link:not(.repository-preview .preview-link)').all()) {
      const frame = await preview.boundingBox();
      const image = await preview.locator('img').boundingBox();
      expect(image.width).toBeCloseTo(frame.width, 1);
      expect(image.height).toBeCloseTo(frame.height, 1);
    }
    for (const card of await page.locator('.education-card').all()) {
      const bounds = await card.boundingBox();
      const logo = await card.locator('.education-logo').boundingBox();
      const heading = await card.locator('.education-heading > div').boundingBox();
      expect(logo.width).toBe(80);
      expect(logo.height).toBe(80);
      expect(Math.abs(bounds.x + bounds.width - logo.x - logo.width - 23)).toBeLessThan(1);
      expect(Math.abs(logo.y - bounds.y - 23)).toBeLessThan(1);
      expect(heading.x + heading.width).toBeLessThanOrEqual(logo.x - 19);
    }
    await page.screenshot({ path: testInfo.outputPath(`portfolio-${width}.png`), fullPage: true });
    await page.screenshot({ path: testInfo.outputPath(`intro-${width}.png`) });
    await page.locator('#professional-achievements').screenshot({ path: testInfo.outputPath(`professional-achievements-${width}.png`) });
    await page.locator('#academic-achievements').screenshot({ path: testInfo.outputPath(`academic-achievements-${width}.png`) });
    await page.locator('#background').screenshot({ path: testInfo.outputPath(`background-${width}.png`) });
    await page.locator('#highlights').screenshot({ path: testInfo.outputPath(`highlights-${width}.png`) });
    await page.locator('#academic-work').screenshot({ path: testInfo.outputPath(`research-${width}.png`) });
  });
}

test('mobile menu expands in flow, closes on Escape and navigation, and restores native scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  const intro = page.locator('.hero');
  const before = await intro.boundingBox();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect((await intro.boundingBox()).y).toBeGreaterThan(before.y);
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.site-nav')).toBeHidden();
  await toggle.click();
  await page.locator('.site-nav a[href="#academic-work"]').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#academic-work$/);
  await expect(page.locator('#academic-work h2')).toBeInViewport();
  const previousY = await page.evaluate(() => scrollY);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(previousY);
  await expect(page).toHaveURL(/#academic-work$/);
});

test('without JavaScript all content and native navigation remain available', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.site-nav a[href="#academic-work"]')).toBeVisible();
  await expect(page.locator('.menu-toggle')).toBeHidden();
  await page.locator('.site-nav a[href="#academic-work"]').click();
  await expect(page).toHaveURL(/#academic-work$/);
  await expect(page.locator('#academic-work h2')).toBeInViewport();
  await expect(page.locator('.project-card')).toHaveCount(24);
  await expect(page.locator('#background .education-card')).toHaveCount(2);
  await page.locator('.site-nav a[href="#background"]').click();
  await expect(page).toHaveURL(/#background$/);
  await expect(page.locator('#background h2')).toBeInViewport();
  await context.close();
});

test('missing or unsafe configured links stay hidden while valid links remain usable', async ({ page }) => {
  await page.route('**/config.json', route => route.fulfill({ json: {
    'exoskeleton-thesis': 'javascript:alert(1)',
    'gear-meshing-paper': null,
    'contact-email': 'mailto:nilabrosaha2001@gmail.com',
  } }));
  await page.goto('/');
  await expect(page.locator('[data-link-key="exoskeleton-thesis"]')).toBeHidden();
  await expect(page.locator('[data-link-key="gear-meshing-paper"]')).toBeHidden();
  await expect(page.locator('[data-link-key="mechanalyzer-demo"]')).toBeHidden();
  await expect(page.locator('[data-link-key="exoskeleton-code"]')).toBeHidden();
  await expect(page.locator('[data-link-key="full-cv"]')).toHaveCount(1);
  for (const link of await page.locator('[data-link-key="full-cv"]').all()) {
    await expect(link).toBeHidden();
  }
  await expect(page.locator('[data-link-key="contact-email"]')).toHaveAttribute('href', 'mailto:nilabrosaha2001@gmail.com');
});

test('keyboard skip link and reduced-motion preferences remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await expect(page.locator('.button').first()).toHaveCSS('transition-duration', '0s');
});

test('corrected videos, research repositories, proposals, and CV actions use their intended destinations', async ({ page }) => {
  await page.goto('/');
  const links = {
    'mechanalyzer-demo': 'https://youtu.be/-LSQcEB2ASo',
    'sih-submission': 'https://youtu.be/GLIL7M9gD0A',
    'gear-meshing-presentation': 'https://youtu.be/fwrT8IEonCg',
    'exoskeleton-code': 'https://github.com/nilabro-saha/hand-exoskeleton',
    'parallel-kinematic-code': 'https://github.com/nilabro-saha/parallel-kinematic-cosimulation',
    'opjems-proposals': 'https://zenodo.org/search?q=NilsahaOPJEMSProposal&l=list&p=1&s=10&sort=bestmatch',
    'full-cv': 'https://drive.google.com/file/d/1WKK1BT2Yicp4fLi1GTT58tTPq6wHXBvZ/view?usp=sharing',
    'contact-github': 'https://github.com/nilabro-saha',
  };
  for (const [key, url] of Object.entries(links)) {
    const anchors = page.locator(`[data-link-key="${key}"]`);
    await expect(anchors).toHaveCount(key === 'opjems-proposals' ? 2 : 1);
    for (const anchor of await anchors.all()) {
      await expect(anchor).toHaveAttribute('href', url);
      await expect(anchor).toHaveAttribute('target', '_blank');
      await expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    }
  }
  await expect(page.locator('#academic-work [data-link-key="mechanalyzer-demo"]')).toHaveAccessibleName('YouTube Presentation');
  await expect(page.locator('#academic-achievements [data-link-key="sih-submission"]')).toHaveAccessibleName('YouTube Presentation');
  await expect(page.locator('.contact-links [data-link-key="full-cv"]')).toHaveAccessibleName('View CV');
});

test('CV additions preserve academic status, research limits, and compact professional experience', async ({ page }) => {
  await page.goto('/');
  const background = page.locator('#background');
  const graduate = background.locator('[aria-label="Georgia Tech graduate education"]');
  await expect(graduate).toContainText('August 2026–present · In progress');
  await expect(graduate).toContainText('CS 7638: Robotics: AI Techniques — in progress');
  await expect(graduate).toContainText('Bayesian filters, search, PID control, and SLAM');
  const undergraduate = background.locator('[aria-label="NIT Durgapur undergraduate education"]');
  await expect(undergraduate).toContainText('June 2018–May 2022');
  await expect(undergraduate).toContainText('9.31/10');
  await expect(undergraduate).toContainText('2nd out of 149');
  await expect(undergraduate).toContainText('AMM India');
  await expect(background.locator('h2')).toHaveText('Education');
  await expect(page.locator('.skills-grid, [aria-label="Technical skills"]')).toHaveCount(0);
  await expect(page.locator('#publications .publication-dates')).toHaveText([
    'Published: 2023 · First online: 2022', 'Published: 2022 · First online: 2021',
  ]);
  const exoskeleton = page.locator('[aria-label="Underactuated hand exoskeleton"]');
  await expect(exoskeleton).toContainText('modeled MCP range to approximately 110°');
  await expect(exoskeleton).toContainText('interference near 60°');
  await expect(exoskeleton).toContainText('45° finger-PIP and 50° thumb flexion targets');
  await expect(exoskeleton).toContainText('Shibendu Shekhar Roy');
  await expect(exoskeleton).toContainText('Abhijit Mahapatra');
  const parallel = page.locator('[aria-label="Parallel-kinematic system modelling"]');
  await expect(parallel).toContainText('four-state cart-pendulum benchmark');
  await expect(parallel).toContainText('measuring-stage controller remained future work');
  await expect(parallel).toContainText('Dr. N. C. Murmu');
  const software = page.locator('#highlights');
  await expect(software.locator('.role-progression')).toContainText('Senior Application Solution Developer, October 2025–present');
  await expect(software.locator('[aria-label="Data and performance"] li')).toHaveCount(3);
  await expect(software.locator('[aria-label="Enterprise applications and AI"] li').last()).toHaveText('Also used agentic coding for selected cross-stack development.');
  for (const metric of ['9.5×', '110M+ events/day', '75%+', '97%', '23k+', '99%', '25+', '100k+ row', '63%']) {
    await expect(software).toContainText(metric);
  }
  await expect(page.locator('#highlights')).toContainText('May 2021–May 2022');
  await expect(page.locator('#professional-achievements .project-card').last()).toHaveAttribute('aria-label', 'Oracle OCI DevOps certification');
  await expect(page.locator('[aria-label="Oracle OCI DevOps certification"]')).toContainText('Awarded December 2024');
  await expect(page.locator('.additional-certifications')).toContainText('OCI Generative AI');
  await expect(page.locator('.additional-certifications')).not.toContainText('OCI DevOps');
  await expect(page.locator('main')).not.toContainText('GRE');
  await expect(page.locator('main')).not.toContainText('TOEFL');
  await expect(page.locator('main')).not.toContainText('Outstanding');
});

test('platform links use uniform labels and decorative local icons on the right cards', async ({ page }, testInfo) => {
  await page.goto('/');
  const platforms = {
    'mechanalyzer-demo': ['YouTube Presentation', 'youtube.ico'],
    'sih-submission': ['YouTube Presentation', 'youtube.ico'],
    'gear-meshing-presentation': ['YouTube Presentation', 'youtube.ico'],
    'exoskeleton-code': ['Code', 'github.svg'],
    'parallel-kinematic-code': ['Code', 'github.svg'],
    'exoskeleton-thesis': ['Zenodo Article', 'zenodo.png'],
    'seminar-wearable-technology': ['Zenodo Article', 'zenodo.png'],
    'seminar-compliant-mechanisms': ['Zenodo Article', 'zenodo.png'],
    'gear-meshing-paper': ['View Paper', 'springer.ico'],
    'kinematics-paper': ['View Paper', 'springer.ico'],
    'opjems-proposals': ['Browse Proposals', 'zenodo.png'],
  };
  for (const [key, [label, icon]] of Object.entries(platforms)) {
    for (const anchor of await page.locator(`[data-link-key="${key}"]`).all()) {
      await expect(anchor).toHaveAccessibleName(label);
      await expect(anchor.locator('img')).toHaveAttribute('src', `./assets/platform-icons/${icon}`);
      await expect(anchor.locator('img')).toHaveAttribute('alt', '');
      await expect(anchor.locator('img')).toHaveAttribute('aria-hidden', 'true');
      await expect(anchor.locator('.external-arrow')).toHaveText('↗');
      await expect(anchor.locator('.external-arrow')).toHaveAttribute('aria-hidden', 'true');
    }
  }
  await expect(page.locator('[aria-label="Underactuated hand exoskeleton"] [data-link-key="exoskeleton-code"]')).toBeVisible();
  await expect(page.locator('[aria-label="Parallel-kinematic system modelling"] [data-link-key="parallel-kinematic-code"]')).toBeVisible();
  await expect(page.locator('.platform-link')).toHaveCount(17);
  await loadPreviews(page);
  await page.locator('#academic-work').screenshot({ path: testInfo.outputPath('academic-code-links.png') });
});

test('contacts appear once in the introduction and the old contact anchor remains usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const contacts = page.locator('.hero #contact');
  await expect(contacts.locator('a')).toHaveText(['Email ↗', 'LinkedIn ↗', 'GitHub ↗', 'ORCID ↗', 'View CV ↗']);
  await expect(page.locator('.hero-positions li')).toHaveText([
    'Master of Science in Computer Science (Online) — Georgia Tech',
    'Senior Application Developer IC3 — Oracle',
    'Bachelor of Technology in Mechanical Engineering — NIT Durgapur',
  ]);
  const positions = page.locator('.hero-positions');
  await expect(positions).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(positions).toHaveCSS('font-family', '"Exo 2", Helvetica, Arial, sans-serif');
  await expect(positions).toHaveCSS('font-weight', '600');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => [...document.fonts].some(font => font.family === 'Exo 2' && font.status === 'loaded'))).toBe(true);
  for (const heading of await page.locator('h3').all()) {
    await expect(heading).toHaveCSS('font-family', '"Exo 2", Helvetica, Arial, sans-serif');
  }
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  for (const [selector, family] of [
    ['h1', 'Playfair Display'], ['h2', 'Playfair Display'], ['h3', 'Exo 2'],
    ['.hero-positions li span', 'Exo 2'],
    ['.lede', 'Exo 2'], ['.eyebrow', 'Exo 2'], ['.identity .name', 'Exo 2'],
    ['.site-nav a', 'Exo 2'], ['.card-copy p', 'Exo 2'],
    ['.external-arrow', 'Inter'], ['.directional-arrow', 'Inter'],
  ]) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(fonts.length).toBeGreaterThan(0);
    expect(fonts.every(font => font.isCustomFont && font.familyName.startsWith(family))).toBe(true);
  }
  await cdp.detach();
  for (const logo of await positions.locator('img').all()) {
    await expect(logo).toHaveCSS('width', '14px');
    await expect(logo).toHaveCSS('height', '14px');
  }
  const platforms = ['email.svg', 'linkedin.ico', 'github.svg', 'orcid.svg', 'drive.ico'];
  for (const [index, anchor] of (await contacts.locator('a').all()).entries()) {
    await expect(anchor.locator('img')).toHaveAttribute('src', `./assets/platform-icons/${platforms[index]}`);
  }
  await expect(page.locator('section#contact, .contact-section')).toHaveCount(0);
  await expect(page.locator('.site-nav a[href="#contact"], .hero-actions a[href="#contact"]')).toHaveCount(0);
  await expect(page.locator('.hero-actions > .button')).toHaveAccessibleName('Explore academic work');
  await page.goto('/#contact');
  await expect(contacts).toBeInViewport();
});

test('award preview fits the supplied badge without email-excerpt language', async ({ page }) => {
  await page.goto('/');
  const award = page.locator('[aria-label="Oracle Rock Stars Gold Award"]');
  const image = award.locator('.award-badge');
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute('src', './assets/previews/oracle-rock-stars-badge.png');
  await expect(award.locator('.preview-link')).toHaveAttribute('href', './assets/previews/oracle-rock-stars-badge.png');
  await expect(image).toHaveAttribute('alt', /Gold Award badge, September 2024/);
  await expect.poll(() => image.evaluate(element => [element.naturalWidth, element.naturalHeight])).toEqual([90, 120]);
  await expect(award.locator('figcaption')).toHaveCount(0);
  await expect(award.locator('.card-detail')).toHaveText('Awarded September 2024');
  await expect(award).not.toContainText(/email|excerpt/i);
});

test('fresh link configuration overrides an older browser-cached copy', async ({ page }) => {
  const { createServer } = await import('node:http');
  const { readFile } = await import('node:fs/promises');
  const docs = new URL('../docs/', import.meta.url);
  const current = JSON.parse(await readFile(new URL('config.json', docs), 'utf8'));
  const stale = { ...current, 'full-cv': null, 'mechanalyzer-demo': 'https://youtu.be/GLIL7M9gD0A' };
  delete stale['exoskeleton-code'];
  delete stale['parallel-kinematic-code'];
  let useCurrent = false;
  let configRequests = 0;
  const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
  const server = createServer(async (request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (path === '/config.json') {
      configRequests++;
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=31536000' });
      response.end(JSON.stringify(useCurrent ? current : stale));
      return;
    }
    if (path === '/warmup') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<!doctype html><title>Cache warmup</title>');
      return;
    }
    try {
      const file = new URL(path === '/' ? 'index.html' : path.slice(1), docs);
      if (!file.href.startsWith(docs.href)) throw new Error('Invalid test path');
      const body = await readFile(file);
      const extension = file.pathname.slice(file.pathname.lastIndexOf('.'));
      response.writeHead(200, { 'Content-Type': types[extension] ?? 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.goto(`${origin}/warmup`);
    // Prime the actual HTTP cache with the outdated response, then change the server's copy.
    await page.evaluate(() => fetch('/config.json').then(response => response.json()));
    expect(configRequests).toBe(1);
    useCurrent = true;
    const cached = await page.evaluate(() => fetch('/config.json').then(response => response.json()));
    expect(cached['exoskeleton-code']).toBeUndefined();
    expect(configRequests).toBe(1);
    await page.goto(origin);
    for (const key of ['exoskeleton-code', 'parallel-kinematic-code', 'full-cv']) {
      const anchor = page.locator(`[data-link-key="${key}"]`);
      await expect(anchor).toBeVisible();
      await expect(anchor).toHaveAttribute('href', current[key]);
    }
    await expect(page.locator('[data-link-key="mechanalyzer-demo"]')).toHaveAttribute('href', current['mechanalyzer-demo']);
    expect(configRequests).toBe(2);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('research card images use the selected source figures and open full-size previews', async ({ page }) => {
  await page.goto('/');
  await loadPreviews(page);
  const figures = [
    ['Underactuated hand exoskeleton', 'exoskeleton-assembly.jpg', [2174, 2208]],
    ['Parallel-kinematic system modelling', 'parallel-stage-load-cases.jpg', [2019, 1048]],
  ];
  for (const [label, file, dimensions] of figures) {
    const card = page.locator(`article[aria-label="${label}"]`);
    const figure = card.locator('.repository-preview');
    await expect(figure.locator('img')).toHaveAttribute('src', `./assets/previews/${file}`);
    await expect(figure.locator('.preview-link')).toHaveAttribute('href', `./assets/previews/${file}`);
    await expect(figure.locator('figcaption')).toHaveCount(0);
    expect(await figure.locator('img').evaluate(image => [image.naturalWidth, image.naturalHeight])).toEqual(dimensions);
    await expect(card.getByRole('link', { name: 'Code', exact: true })).toBeVisible();
    const popupPromise = page.waitForEvent('popup');
    await figure.locator('.preview-link').click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    await expect(popup).toHaveURL(new RegExp(`/assets/previews/${file.replace('.', '\\.')}$`));
    await popup.close();
  }
  await expect(page.locator('[aria-label="MechAnalyzer mechanism simulation"] .preview-link img')).toHaveAttribute('src', /assets\/previews\/mechanalyzer-mechanisms\.webp\?v=/);
  await expect(page.locator('#academic-work .repository-preview')).toHaveCount(2);
});

test('certificate cards load responsive previews and retain high-resolution full-size images', async ({ page }) => {
  const { readFile } = await import('node:fs/promises');
  const manifest = JSON.parse(await readFile(new URL('../docs/assets/previews/CERTIFICATE-SOURCES.json', import.meta.url), 'utf8'));
  await page.goto('/');
  await loadPreviews(page);
  expect(manifest).toHaveLength(10);
  for (const entry of manifest) {
    const image = page.locator(`.card-media img[src^="./assets/previews/${entry.name}.webp?"]`);
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute('width', String(entry.width));
    await expect(image).toHaveAttribute('height', String(entry.height));
    await expect(image).toHaveAttribute('srcset', `./assets/previews/${entry.name}-preview.webp?v=${entry.version} ${entry.preview_width}w, ./assets/previews/${entry.name}.webp?v=${entry.version} ${entry.width}w`);
    expect(await image.evaluate(element => element.currentSrc)).toContain(`${entry.name}-preview.webp`);
    const response = await page.request.get(await image.getAttribute('src'));
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
});
