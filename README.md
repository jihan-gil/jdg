# John Dave Guillermo — Portfolio

A static, single-page portfolio built with HTML, CSS, vanilla JavaScript, and optional Three.js GLB viewers.

## Run locally

Open the folder through a lightweight local web server (for example, VS Code Live Server). This is needed for ES modules and GLB loading. Do not load STEP files directly in the browser.

## Add interactive models

Convert the supplied STEP sources into optimized GLB files and place them next to `index.html` using the names referenced in `data.js`, such as `FireDoor.glb`. The page detects the files when they are available; until then it presents a designed technical fallback.

## GitHub Pages

1. Push this folder to a GitHub repository.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the branch and `/ (root)` folder, then save.
4. Visit the published site URL after GitHub finishes deployment.

All site assets use relative paths. The download links intentionally download the PDF and Windows installers rather than executing them.
