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

- Edit factual prose and card order in `docs/index.html`. The page has four Highlights cards (research, academics and leadership, data and performance, and enterprise applications and AI), five academic projects, two publications, seven academic achievements, and four professional achievements. Highlights use concise bullets; the enterprise card ends with agentic coding applied to selected cross-stack development tasks as an additional practice. Education adds two degree cards after Publications; `#background` remains its navigation anchor. Institution logos sit at the upper right of each education card, with source URLs in `docs/assets/education/SOURCES.md`. There is no standalone skills block. Highlights and both achievement sections use four columns on wide screens; academic projects use three. Grids reduce to two columns on tablets and one on phones; publications and education use at most two columns. Preview images fill the available width or height without distorting their proportions, with no visible captions or inset padding; clicking opens their existing local files at full size. All main content is semantic HTML and remains visible if JavaScript is disabled.
- Edit external evidence and contact URLs in `docs/config.json`. Keys are readable kebab-case identifiers used by `data-link-key` on anchors. A missing, `null`, or non-HTTPS/non-`mailto:` URL hides its anchor. The introduction contains the only contact row: Email, LinkedIn, GitHub, ORCID, and View CV. Its `#contact` anchor preserves existing direct links, and `full-cv` opens the user-supplied Google Drive CV viewer; the PDF is not copied into this repository.
- Research cards link the hand-exoskeleton and parallel-kinematic repositories. The MechAnalyzer card shows the complete 11-mechanism grid cropped from page 5 of the RAMA 2021 review, with provenance in `docs/assets/previews/RESEARCH-SOURCES.md`. `mechanalyzer-demo` opens the Coupler Curves and Linkage Atlases video; `sih-submission` opens Team Gutenberg's hackathon submission. Evidence and contact links use single-line text with local left-hand platform icons and a decorative northeast arrow on the right. The contact group sits alongside Explore academic work and wraps naturally on narrow screens. Below it, three logo-and-text rows list the Georgia Tech M.S., Oracle Senior Application Developer IC3 role, and NIT Durgapur B.Tech., in that order. These rows use black, 14px Exo 2 SemiBold text and compact text-height logos. Website text uses self-hosted Exo 2, with Playfair Display for the hello title and section headings and Inter for northeast/southeast arrows. Font and compact logo sources are documented alongside the assets. Video links read “YouTube Presentation”, repository links “Code”, individual Zenodo records “Zenodo Article”, and Springer links “View Paper”. OPJEMS proposal links read “Browse Proposals” and explicitly open a Zenodo search, not an individual record. Platform icon sources are documented in `docs/assets/platform-icons/SOURCES.md`.
- Academic facts and concise software impact are based on the October 25, 2026 CV. Current Georgia Tech coursework stays marked in progress. Exoskeleton copy separates the approximately 110° modeled MCP range from interference near 60° index-MCP flexion; the cart-pendulum LQR benchmark is separate from future measuring-stage controller work. Publication years and first-online years are labelled separately. Test scores and performance-evaluation ratings stay in the CV.
- Edit colours and page dimensions in `docs/css/tokens.css`; layout, spacing, and components live in the other CSS files. The design uses Exo 2 typography with Playfair Display for the hello title and section headings and Inter arrows, an ivory canvas, and red accents. Native section anchors, ordinary keyboard scrolling, and reduced-motion preferences are supported; the mobile menu expands in the page flow.
- The hand-exoskeleton and parallel-kinematic cards use user-selected figures from their public GitHub repositories. CSS frames the frontal hand assembly and initial stage model; each preview opens the full unmodified JPEG. Source commits, SHA-256 hashes, and original MIT notices are recorded in `docs/assets/previews/RESEARCH-SOURCES.md`. MechAnalyzer retains its original conceptual SVG. Publication cards use locally generated first-page title-and-abstract excerpts of the cited papers.

## Certificate previews and provenance

The Rock Stars Gold Award card uses the user-supplied September 2024 badge, copied without conversion to `oracle-rock-stars-badge.png`. Although the source filename ended in `.jpeg`, its bytes are PNG. Its transparent 90 × 120 source image is scaled proportionally to fit the preview frame. The previous email excerpt remains unused.

Certificate previews are regenerated directly from the individual source PDFs at **400 DPI**, with explicit outer-margin crops and **lossless WebP** encoding. No presentation canvas, padding, credential-number masking, or other redactions are added. The complete certificate designs, signatures, QR codes, and credential IDs remain visible. Full-resolution images open on click; responsive 1600px display copies keep the cards lightweight. Source filenames, crop coordinates, dimensions, DPI, and encoding are recorded in `docs/assets/previews/CERTIFICATE-SOURCES.json`.

To regenerate the nine certificate images and the INAE evidence composite (the IndianOil source is in `../../5. CERTIFICATES/IndianOil Meritorious Student Award.pdf` relative to the prepared-documents folder):

```sh
python3 scripts/render_previews.py --source-dir '/path/to/Prepared Documents'
```

The script requires Pillow and Poppler's `pdftoppm`; `--dpi` defaults to 400. INAE combines two authentic excerpts—the approval passage and the complete named appendix row—with a small separator and no outer matte. The Rock Stars badge remains the separately supplied image described above.

Seminar and publication previews are unchanged by the default command. To regenerate them too, optionally supply `--seminar-one`, `--seminar-two`, `--gear-paper`, and `--linkage-paper` with their PDF paths. Do not add the passport, transcript, full application bundles, or unrelated documents to the public site. The specifically requested public research figures are documented separately in `RESEARCH-SOURCES.md`.

## GitHub Pages

The project is ready to publish from the `main` branch's `/docs` directory, with `.nojekyll` included. The site uses relative asset paths, so it can run under a Pages project path or at a personal root site.
