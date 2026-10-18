# Sideworks — instructions for coding agents

**Before every change:** read [README.md](./README.md) and this AGENTS.md. The root [index.html](./index.html) publicly shows the operational rules to humans and AI visitors. Its content must remain consistent with the canonical README. Do not skip these instructions even when a user only asks to create a page at a new path.

## Architecture (non-negotiable)

- This is a **collection of independent publications**, not a unified app. Public URLs follow `https://totoro0419.github.io/Alts/<slug>/`.
- Do not implement a shared SPA/router or centralized main application at `/Alts/`.
- Create/update only the user's requested `<slug>/` directory. Each project owns its `index.html`, styles, assets, data and (if necessary) build output.
- Keep the repository's `README.md`, `AGENTS.md`, `.nojekyll` and root `index.html` stable unless the user explicitly requests foundational changes.
- No automatic edits to other publication directories; never delete or rename existing paths as a side effect.
- Preserve existing project behavior when making an incremental change.

## New publication checklist

1. Choose a unique concise lowercase kebab-case `slug` with no conflict with root infrastructure.
2. Implement `<slug>/index.html`. Put any project assets under `<slug>/assets/` unless the project requires a different internal structure.
3. Make all file and navigation paths correct under the `/Alts/<slug>/` base. Prefer relative URLs like `./assets/style.css`. Avoid root-absolute `/assets/...`.
4. Prefer static HTML/CSS/JS. A framework is permitted only when justified and **its output is publishable within the project's own directory**; it must not change other sites.
5. Do not assume the host supports server-side execution or history-route fallback. Favor ordinary document navigation or hash routing.
6. Scope any localStorage/IndexedDB/cache names to the project; never register root-wide service workers.
7. Avoid including secrets or private information in commits, URL parameters, or bundled assets.
8. Make pages mobile-first, keyboard-accessible, readable, and resilient to refresh/offline conditions as the individual project requires.

## Required checks before completion

- Inspect diffs: no unrelated paths changed.
- Verify `<slug>/` loads directly, and browser refresh does not fail.
- Verify CSS, JS, images, imports and internal links under the actual `/Alts/<slug>/` URL.
- Verify functions and mobile/tablet layouts applicable to the page; check browser console where possible.
- Record what was tested, what remains untested, and whether the GitHub Pages **live URL** was independently verified.
- Do not claim a live publication when only source commits have been completed.
- Reply with the exact direct path of the specific site, **not only** the repository homepage.

## Reserved top-level paths

Do not assign publication slugs: `assets`, `docs`, `api`, `src`, `public`, `node_modules`, `vendor`, `tests`, `dist`, `build`, `_site`, `github`.

When in doubt, follow the user's exact project-specific requirements while preserving these isolation and publication rules.
