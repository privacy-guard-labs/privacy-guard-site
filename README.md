# privacy-guard-site

Marketing landing page for **Privacy Guard** — a macOS and Windows desktop app that redacts PII from text and documents before sharing with cloud AI.

**Live:** [privacy-guard-labs.github.io/privacy-guard-site](https://privacy-guard-labs.github.io/privacy-guard-site/)

## Project Structure

```
privacy-guard-site/
├── index.html          # Main page (HTML only, references external CSS/JS)
├── css/
│   └── style.css       # Design tokens, glassmorphism, responsive breakpoints, animations
├── js/
│   └── main.js         # Canvas particles, scroll reveals, live demo, edit mode, tabs
├── icons/
│   ├── 32x32.png
│   ├── 128x128.png
│   ├── 128x128@2x.png
│   ├── icon.icns
│   ├── icon.ico
│   └── og.png          # Open Graph / Twitter card image
├── manifest.json       # PWA manifest
├── CLAUDE.md           # AI assistant context
└── README.md
```

## Running Locally

No build step. Open directly or serve statically:

```bash
open index.html
# or
python3 -m http.server 8000
# or
npx serve .
```

## Tech Stack

- **HTML / CSS / vanilla JS** — no framework, no bundler, no package manager
- **IBM Plex Sans + Mono** via Google Fonts
- **Dark theme** with CSS custom properties: `--canvas: #0b1015`, `--accent: #81dcc6`
- **Glassmorphism** via `backdrop-filter: blur()` with semi-transparent backgrounds
- **Scroll animations** via IntersectionObserver with staggered child delays
- **Canvas particle background** with inter-particle connections and mouse-repulsion physics

## Page Sections

| Section | Description |
|---------|-------------|
| Hero | CTA buttons, terminal-style typewriter demo |
| Problem | Three scenarios: AI prompts, documents, automation pipelines |
| Live Demo | Animated PII detection with typewriter effect, scanline sweep, and three redaction styles (placeholder / mask / hash) |
| Trust Bar | Key stats: local by design, 19 data types, zero cloud calls, open core |
| How It Works | Three-step flow: paste → detect → review & export |
| Edit Mode | Interactive prototype — click tokens to reveal, select text to manually redact, export with toast notifications |
| PII Categories | 19 types in a scrolling marquee, including Italian-specific (Codice Fiscale, P.IVA, Tessera Sanitaria, etc.) |
| Use Cases | Tabbed scenarios: AI prompts, legal, data, automation, any text |
| Features | Six capabilities: text redaction, document import, batch processing, entity review, dual AI models, HTTP API + CLI |
| Redaction Styles | Live comparison of placeholder, mask, and hash styles |
| Architecture | Visual flow: React UI → Rust Backend → AI Model / Regex Fallback |
| CTA | Download button for macOS and Windows (Apple Silicon) |

