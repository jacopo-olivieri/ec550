# EC550 Syllabus Website

This folder contains a no-build static website for the EC550 syllabus.

## Files

- `index.html`: page layout and controls
- `styles.css`: visual styling
- `app.js`: accordion/filter behaviour
- `data.js`: all syllabus content (sections, papers, abstracts)
- `papers/`: local PDFs linked by the site

## Editing Content

Edit `data.js` only.

- Section order and paper order come from the `sections` array.
- Set `core: true` for core readings (papers marked `*` in the PDF).
- Add or edit `abstract` for each paper.
- Add `localPdf` for local files, `doi` for DOI links, or `url` for non-DOI links.
- If you add a new `localPdf`, place that PDF inside `syllabus-site/papers/`.

## Open Locally

Double-click `index.html` in this folder.

## Deploy with GitHub Pages

This project includes a workflow that deploys `syllabus-site/` directly to GitHub Pages.

1. Push this repository to GitHub.
2. In GitHub: `Settings -> Pages -> Build and deployment -> Source`, choose `GitHub Actions`.
3. Push to `main` (or run the workflow manually).

The workflow publishes exactly this folder as the site.
