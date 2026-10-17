# Robo-COP project website

Static research page for *Co-Evolving Robot Orchestrators and Policies through Deployment*.

Paper: https://arxiv.org/abs/2610.09228

## Local preview

Run `python3 -m http.server 8000` in this folder, then open http://localhost:8000.

## Publish under XilunZhangRobo

1. Create a repository named `robo-cop` at https://github.com/new under **XilunZhangRobo**.
2. Upload the contents of this folder, including `.github/workflows/pages.yml` and `.nojekyll`, to its `main` branch. You can also use GitHub Desktop to add this folder and publish it.
3. In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
4. Run **Actions → Deploy project website → Run workflow** if the initial push preceded the Pages setting.

The expected project URL is https://xilunzhangrobo.github.io/robo-cop/ once deployment succeeds. This URL has not yet been published.

All asset URLs are relative, so the site works at a repository subpath. No dependencies or build step are required. All media files are below GitHub's single-file size limit.

## Editing

- `index.html`: title, authors, paper links, captions, citation, and section order.
- `paper.css`: page typography and responsive layout.
- `style.css`: existing demo components.
- `app.js`, `curves.js`, `pipeline.js`: recorded trial explorer and walkthrough.
- `trace-data.js`: original recorded evidence.
- `assets/`: project figures and videos.

Affiliations are shown collectively; individual author superscripts should be added after confirming the final affiliation mapping. No code-release repository is linked until its destination is confirmed.

The original source copy remains unchanged in the October 15 workspace.
