# EC550 Syllabus Website

## Purpose
This folder contains the static website for the EC550 syllabus. The site is intentionally lightweight: all content is driven from a single data file and rendered client-side.

## Folder Layout

- `index.html`: semantic page shell and controls
- `styles.css`: visual design and responsive layout rules
- `app.js`: UI behaviour for filtering, navigation, and rendering
- `data.js`: all course content (authoritative source of truth)
- `papers/`: local PDF files linked from `data.js`

## Editing Workflow

1. Edit `data.js` for syllabus updates.
2. Keep `index.html`, `styles.css`, and `app.js` stable unless you need layout or interaction changes.
3. Open `index.html` directly in a browser for a quick smoke check.
4. If anything changes, run through the deployment check in the section below.

## `data.js` Best Practices

- Keep the `sections` array ordered in the sequence you want displayed.
- Keep paper order inside each section intentional and stable across semesters.
- Use `core: true` only for required readings.
- Fill `abstract` even if short; avoid leaving placeholder text.
- Prefer `doi` for canonical links and `url` only when DOI is unavailable.
- For offline files, use `localPdf` and place PDFs under `papers/`.
- Use consistent naming for paper fields (`title`, `authors`, `year`, `link`, etc.) so future scripts can parse reliably.

<!-- Best-practice checks -->
- Ensure every required reading has either `doi`/`url` or `localPdf`, never all three missing.
- Keep filenames simple and descriptive to avoid broken links on case-sensitive hosts.

## Local Viewing

- Open this folder and double-click `index.html`

## Deployment (GitHub Pages)

The repository includes a workflow that publishes this folder to Pages.

1. Push changes to the repository.
2. In GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Merge to `main` (or manually run the workflow).
4. Confirm the workflow output includes this folder only.