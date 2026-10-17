# Robo-COP project website

Static research page for *Co-Evolving Robot Orchestrators and Policies through Deployment*.

Paper: https://arxiv.org/abs/2610.09228

## Local preview

Run `python3 -m http.server 8000` in this folder, then open http://localhost:8000.

## GitHub Pages deployment

Repository: https://github.com/XilunZhangRobo/robo-cop

Website: https://xilunzhangrobo.github.io/robo-cop/

The `main` branch deploys automatically through `.github/workflows/pages.yml`. In **Settings → Pages**, the source is **GitHub Actions**. To redeploy manually, open **Actions → Deploy project website → Run workflow**.

All asset URLs are relative, so the site works at a repository subpath. No dependencies or build step are required. All media files are below GitHub's single-file size limit.

## Editing

- `index.html`: title, authors, paper links, captions, citation, and section order.
- `paper.css`: page typography and responsive layout.
- `style.css`: existing demo components.
- `app.js`, `curves.js`, `pipeline.js`: recorded trial explorer and walkthrough.
- `trace-data.js`: original recorded evidence.
- `assets/`: project figures and videos.

Author superscripts and equal advising follow the arXiv v1 source. Author names link to their verified personal or faculty homepages. Background clips autoplay muted, with a pause control and reduced-motion support. No code-release repository is linked until its destination is confirmed.

