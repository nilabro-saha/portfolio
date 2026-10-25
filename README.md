# Nilabro Saha portfolio

A static, admissions-focused portfolio with a research introduction, compact card grids, and natural page scrolling. The published site is entirely inside `docs/`; no source application PDFs or private records are included.

## Preview and test

From the project root:

```sh
npm run preview
```

Open `http://localhost:4173`. Use an HTTP server rather than opening `index.html` directly, because browser security rules block `config.json` loading from `file://`.

For browser tests:

```sh
npm install
npm test
```

Tests use the locally installed Google Chrome. If Chrome is unavailable, remove `channel: 'chrome'` from `playwright.config.mjs` and install Playwright Chromium with `npx playwright install chromium`.

## Edit content and links

- Edit factual prose and card order in `docs/index.html`. The page retains all highlights, five academic projects, two publications, six academic achievements, and three professional achievements. Education adds two degree cards after Publications; `#background` remains its navigation anchor. Institution logos sit at the upper right of each education card, with source URLs in `docs/assets/education/SOURCES.md`. There is no standalone skills block. Cards use three columns on wide screens, two on tablets, and one on phones; publications and education use at most two columns. Preview images open their existing local files at full size. All main content is semantic HTML and remains visible if JavaScript is disabled.
- Edit external evidence and contact URLs in `docs/config.json`. Keys are readable kebab-case identifiers used by `data-link-key` on anchors. A missing, `null`, or non-HTTPS/non-`mailto:` URL hides its anchor. The introduction contains the only contact row: Email, LinkedIn, GitHub, ORCID, and View CV. Its `#contact` anchor preserves existing direct links, and `full-cv` opens the user-supplied Google Drive CV viewer; the PDF is not copied into this repository.
- Research cards link the hand-exoskeleton and parallel-kinematic repositories. `mechanalyzer-demo` opens the Coupler Curves and Linkage Atlases video; `sih-submission` opens Team Gutenberg's hackathon submission. Evidence and contact links use single-line text with local left-hand platform icons and a decorative northeast arrow on the right. The contact group sits alongside Explore academic work and wraps naturally on narrow screens. Video links read “YouTube Presentation”, repository links “Code”, individual Zenodo records “Zenodo Article”, and Springer links “View Paper”. OPJEMS proposal links read “Browse Proposals” and explicitly open a Zenodo search, not an individual record. Platform icon sources are documented in `docs/assets/platform-icons/SOURCES.md`.
- Academic facts and concise software impact are based on the October 25, 2026 CV. Current Georgia Tech coursework stays marked in progress. Exoskeleton copy separates the approximately 110° modeled MCP range from interference near 60° index-MCP flexion; the cart-pendulum LQR benchmark is separate from future measuring-stage controller work. Publication years and first-online years are labelled separately. Test scores and performance-evaluation ratings stay in the CV.
- Edit colours and page dimensions in `docs/css/tokens.css`; layout, spacing, and components live in the other CSS files. The design uses Inter typography, an ivory canvas, and red accents. Native section anchors, ordinary keyboard scrolling, and reduced-motion preferences are supported; the mobile menu expands in the page flow.
- The hand-exoskeleton and parallel-kinematic cards use user-selected figures from their public GitHub repositories. CSS frames the frontal hand assembly and initial stage model; each preview opens the full unmodified JPEG. Source commits, SHA-256 hashes, and original MIT notices are recorded in `docs/assets/previews/RESEARCH-SOURCES.md`. MechAnalyzer retains its original conceptual SVG. Publication cards use locally generated first-page title-and-abstract excerpts of the cited papers.

## Certificate previews and provenance

The Rock Stars Gold Award card uses the user-supplied September 2024 badge, copied without conversion to `oracle-rock-stars-badge.png`. Although the source filename ended in `.jpeg`, its bytes are PNG. Its transparent 90 × 120 image is displayed at native size. The previous email excerpt remains unused.

Other preview WebP images were rendered from the user-supplied prepared-documents folder and the two public Zenodo seminar PDFs; original PDFs are not stored in the project. To regenerate locally:

```sh
python3 scripts/render_previews.py \
  --source-dir '/path/to/Prepared Documents' \
  --seminar-one '/path/to/Seminar Presentation 1.pdf' \
  --seminar-two '/path/to/Seminar Presentation 2.pdf' \
  --gear-paper '/path/to/Gear Meshing Visualization paper.pdf' \
  --linkage-paper '/path/to/MechAnalyzer kinematics paper.pdf'
```

The script requires Pillow and Poppler's `pdftoppm`. It selects certificate excerpts, full seminar title pages, and the upper halves of both publication first pages. Its crop coordinates and output names are explicit. INAE's approval passage and named appendix row are labelled as **two separate excerpts**; the legacy, unused Oracle email crop stops before the internal nomination and expensing text. Oracle credential IDs are omitted. Do not add the passport, transcript, full application bundles, private email recipient lists, or additional lab-supplied model imagery to this public site. The specifically requested figures from the user’s public hand-exoskeleton and parallel-kinematic repositories are included with source provenance; their captions describe CAD and simulation views rather than fabricated hardware.

## GitHub Pages

The project is ready to publish from the `main` branch's `/docs` directory, with `.nojekyll` included. The site uses relative asset paths, so it can run under a Pages project path or at a personal root site.
