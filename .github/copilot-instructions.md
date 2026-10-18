# Sideworks repository-wide instructions

Before editing this repository, **read the root [AGENTS.md](../AGENTS.md) and [README.md](../README.md)**. They define the canonical rules and mandatory validation steps. The root `index.html` displays these rules to people and AI visitors.

Critical rules:
- Each new page, tool, or learning resource must be a separately publishable folder: `/<slug>/index.html`.
- Its Pages URL is `https://totoro0419.github.io/Alts/<slug>/`, with the exact case-sensitive `/Alts/` prefix.
- Never turn the root into a central app/router. It is a public rules page.
- Restrict modifications to the requested project and explicitly authorized shared files. Do not break or overwrite any other project.
- Use correct project-relative assets, isolate browser storage and service workers, and never commit secrets.
- Verify direct access, reload, asset loading, functionality and responsive layout. Do not claim deployment success without live verification.

These instructions supplement and do not replace `AGENTS.md` or `README.md`.
