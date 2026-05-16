# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-file static landing page for **Privacy Guard**, a macOS desktop app that redacts PII from text/documents before sharing with cloud AI. The landing page itself is purely marketing — it contains no application code.

## Architecture

The entire site lives in `index.html` (~3,300 lines) with inline CSS and vanilla JS. No build tools, no package manager, no framework.

**Internal structure of `index.html`:**
- **Lines 1–15**: `<head>` — meta tags, Open Graph, Google Fonts (IBM Plex Sans/Mono)
- **Lines 16–1966**: `<style>` — CSS custom properties (design tokens on `:root`), glassmorphism nav, scroll-reveal animations, responsive breakpoints at 768px/480px
- **Lines 1968–2740**: `<body>` — page sections: Hero, Problem, Live Demo, Trust Bar, How It Works, Edit Mode, PII Categories marquee, Use Cases tabs, Features grid, Redaction Styles comparison, Architecture diagram, CTA, Footer
- **Lines 2742–3371**: `<script>` — canvas particle background, IntersectionObserver reveals, typewriter demo simulation, Edit Mode interactivity (click-to-restore, text selection redaction), mobile menu, tab switching

## Running Locally

No build step needed. Open directly or serve statically:

```bash
open index.html
# or
python3 -m http.server 8000
# or
npx serve .
```

## Key Technical Details

- **Dark theme** via CSS custom properties: `--canvas: #0b1015`, `--accent: #81dcc6`
- **Glassmorphism**: nav and cards use `backdrop-filter: blur()` with semi-transparent backgrounds
- **Scroll animations**: `.reveal` class toggled by IntersectionObserver, with staggered child delays
- **Canvas particles**: background animation with inter-particle connections and mouse-repulsion physics
- **Live demo**: client-side simulation of PII detection using hardcoded entity positions, typewriter effect, scanline sweep, and three redaction styles (placeholder/mask/hash)
- **Edit Mode**: interactive prototype — click entities to restore, select text to manually redact, export with toast notifications
- **PII categories**: 19 types including Italian-specific ones (Codice Fiscale, Partita IVA, Tessera Sanitaria, etc.)

## Design Context

The page targets `privacyguard.dev` and promotes a Tauri 2 app (Rust + Axum backend, React/TypeScript/Vite frontend, local Python AI model via HuggingFace, Rust regex fallback). The landing page communicates this architecture visually in the Architecture section but contains none of the app code itself.
