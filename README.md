# Sideworks

> Independent pages. One repository.

**Sideworks** is the name of this publication space. The GitHub repository stays **`totoro0419/Alts`**, preserving its Pages URL.

This repository hosts unrelated, independently maintained static web pages, learning materials, small tools, and experiments. **It is not one unified application.** Every publication receives its own top-level URL path.

## Publication URL

When GitHub Pages has been enabled, use:

```text
https://totoro0419.github.io/Alts/<slug>/
```

Examples (illustrative; not yet published):

- `/Alts/kanbun/` — 漢文学習ページ
- `/Alts/math-tools/` — 数学ツール
- `/Alts/experiments/` — 実験ページ

**Do not treat `/Alts/` as an application home.** The root may have a minimal neutral entry page, but publications are distributed and accessed by direct paths.

## Repository layout

```text
/
├── README.md             # This policy and overview
├── AGENTS.md             # Rules for coding agents and contributors
├── .nojekyll             # Serve static content without Jekyll processing
├── index.html            # Minimal neutral root page; not an app
├── kanbun/               # Example path; create only when requested
│   ├── index.html
│   ├── assets/
│   └── ...
└── <another-slug>/
    ├── index.html
    └── assets/
```

The example project directories above are **not** commitments to ship those projects.

## Mandatory publication rules

1. **Path first.** Publish every new item under one uniquely named top-level directory: `/<slug>/`. Do not add a new app to the repository root, nor introduce a global router for all projects.
2. **Stable slugs.** Use lowercase ASCII letters, digits, and hyphens (`a-z`, `0-9`, `-`), beginning and ending with an alphanumeric character. Pick a concise, descriptive slug. Never reuse an existing slug for an unrelated item.
3. **Entry point.** Every public project needs its own `<slug>/index.html`. The direct URL `/Alts/<slug>/` must work and survive a full page reload.
4. **No cross-project interference.** Keep styles, scripts, assets, caches, and data within the owning project. No cross-site dependency on another project's mutable files. Do not overwrite, rename, move, or delete another publication without explicit authorization.
5. **Correct base paths.** GitHub Pages project URLs include the **case-sensitive** `/Alts/` prefix. Use relative links like `./assets/app.css` for static pages; for bundlers, set the correct project-specific base (`/Alts/<slug>/` or an adequately tested relative base). Avoid root-absolute `/assets/...` links.
6. **Client-side routing.** Prefer plain multipage HTML or hash-based routing for SPAs. History-mode deep links require an explicitly verified fallback; do not assume GitHub Pages rewrites arbitrary URLs.
7. **Static hosting by default.** HTML, CSS, JS, images, and PDFs are suitable. GitHub Pages is not a general-purpose application server. Do not rely on server-side PHP/Python or secret server environment variables.
8. **Shared root stays neutral.** Do not add global CSS, JS, a site-wide service worker, redirects, or a showcase homepage as a prerequisite for shipping a project. Project pages must remain independently accessible whether or not a root index lists them.
9. **Safe storage scope.** Browser storage keys and IndexedDB databases must be prefixed by the project slug (example: `sideworks:kanbun:progress`). A project service worker, if genuinely needed, must be registered and scoped only within that project's URL prefix. Avoid uncontrolled cache growth.
10. **No sensitive material.** Do not commit passwords, API secrets, personal data, private test content, or unauthorized copyrighted materials. Everything in this public repository should be treated as public.
11. **Preserve existing functionality.** Changes should be limited to the requested path. Avoid repository-wide build tooling and CI unless cross-project integration is necessary and approved.
12. **Verify before declaring success.** Confirm direct page load, internal links/assets, refresh behavior, console errors, responsive layout on narrow screens, and relevant functional checks. If deployment is not verifiable, report it as **unverified**, not published.

## Publishing workflow

1. Select an unused slug and identify the owning project directory.
2. Implement or update **only** that project and any specifically approved shared infrastructure.
3. Run project-level checks, verify path-safe asset URLs, and review changed files for unexpected cross-project edits.
4. Commit with a scope that identifies the project (e.g. `feat(kanbun): add reading practice`).
5. Publish via GitHub Pages and verify the real public path; supply that exact URL in the completion report.

For this simple static multi-page structure, the intended Pages configuration is **Settings → Pages → Deploy from a branch → `main` → `/(root)`**. GitHub repository settings must be enabled separately if they are not already configured.

A more complex project can use a framework/build step, provided its build output lands **inside that project's public directory** and does not break others. Changing repository-wide deployment architecture requires explicit review.

## AI coding instructions

See [AGENTS.md](./AGENTS.md) for concise mandatory change boundaries and handoff checks.
