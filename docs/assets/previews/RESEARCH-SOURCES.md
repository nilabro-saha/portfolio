# Academic research figures

Sources for academic research card imagery. Repository figures preserve original JPEG bytes and colors; CSS frames a representative panel, with the complete figure opening on click. The MechAnalyzer grid is rendered from the user-provided review PDF.

## exoskeleton-assembly.jpg

- Repository: https://github.com/nilabro-saha/hand-exoskeleton
- Source: https://github.com/nilabro-saha/hand-exoskeleton/blob/bdcb98d52a017799512b7a582ce2365e6db9efb1/figures/assembly-views.jpg
- Commit: `bdcb98d52a017799512b7a582ce2365e6db9efb1`
- SHA-256: `69fbf15512b94d90d5a21e2f8cc65100af4c8705daeaadcef4732b30759609a9`
- These images represent CAD and simulation work, not photographs of fabricated hardware.

### Source repository license

```text
MIT License

Copyright (c) 2021-2022 Nilabro Saha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## parallel-stage-load-cases.jpg

- Repository: https://github.com/nilabro-saha/parallel-kinematic-cosimulation
- Source: https://github.com/nilabro-saha/parallel-kinematic-cosimulation/blob/34cc7feb3417755cc17d5f31c94d3b275d7e6416/figures/ucmm-cases.jpg
- Commit: `34cc7feb3417755cc17d5f31c94d3b275d7e6416`
- SHA-256: `d160a818be66d86407862ff2a44f7ec6ef1c5e2d93ad3cadf821ae9672f700c2`
- These images represent CAD and simulation work, not photographs of fabricated hardware.

### Source repository license

```text
MIT License

Copyright (c) 2021 Nilabro Saha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## mechanalyzer-mechanisms.webp

- Source: `2021 Review/2021 Review.pdf`, RAMA Development Group, edited by Nilabro Saha; published 2 March 2022.
- Location: `11. NIT DURGAPUR DOCUMENTS/RoboAnalyzer and MechAnalyzer RAMA Development Project/2021 Review/2021 Review.pdf` within the user's Nilabro Saha documents.
- Page: 5, “New Mechanisms in MechAnalyzer Core Module”.
- Crop: normalized bounds `(0.112, 0.144, 0.885, 0.948)`, retaining the complete four-panel grid of 11 mechanisms and removing the slide title and outer whitespace.
- Render: 400 DPI, lossless WebP; a 1600px responsive display copy is provided. No recoloring, redaction, or added padding.
- Reproduction: pass `--mechanalyzer-review '/path/to/2021 Review.pdf'` to `scripts/render_previews.py` alongside its source directory.
