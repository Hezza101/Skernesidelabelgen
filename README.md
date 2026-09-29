# Skerneside Beer Label Bench

A small, static browser app for customizing a Skerneside Brewing beer label. It uses the supplied `StratasphereWCIPA.png` artwork for the fixed brewery identity and draws the editable beer details into a live preview. There is no backend, build step, or dependency installation.

## Use the app

Open the deployed site or start a local web server from the project folder. Enter the beer details in the left panel; the label preview updates as you type.

Editable fields:

- Beer name
- Style
- ABV
- IBU
- Malt
- Hops
- Yeast

Select **Reset sample** to restore the original Stratasphere values. Select **Download PNG** to save the current label as `<beer-name>-label.png`. The exported image is 1024 × 1536 pixels. Brewery name, logo, established date, and Instagram handle are part of the fixed artwork and are not editable in the form.

## Run locally on Windows

The site must be served over HTTP so the browser can load the artwork reliably and export the canvas. Do not open `index.html` directly as a `file://` URL.

### Option A: VS Code Live Server

1. Open this folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Right-click `index.html` and choose **Open with Live Server**.

### Option B: Python's built-in server

If Python is installed, open PowerShell in this folder and run:

```powershell
py -m http.server 8000
```

Then open <http://localhost:8000/>. Stop the server with `Ctrl+C`.

## Deploy as a static site

The publish directory is the project root. It must contain all four app files together:

```text
index.html
styles.css
app.js
StratasphereWCIPA.png
```

There is no build command and no server-side runtime required.

### Netlify manual deploy

1. Open Netlify and choose **Add new site** > **Deploy manually** (wording may vary).
2. Upload the project folder, or a ZIP containing the four files at its top level.
3. Leave the build command empty and use the project root as the publish directory if prompted.
4. Open the generated site URL and test the preview and PNG download.

### GitHub Pages

1. Push these files to a GitHub repository. Keep them at the repository root, or configure the Pages source to the directory that contains them.
2. In the repository, open **Settings** > **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select the branch and `/ (root)` folder that contain the files. Save.
4. Wait for the Pages deployment to finish, then open the URL shown in the Pages settings.

For either host, deploy the PNG alongside the HTML file without renaming it: the app loads `StratasphereWCIPA.png` using a relative URL. The app works without Google Fonts access, but uses system fallback fonts if those fonts cannot be loaded.

## Customize the fixed brewery artwork

The artwork is the background layer and supplies the logo, brewery name, `EST. 2013`, and Instagram handle. Replace `StratasphereWCIPA.png` only with a same-proportions label image that has compatible editable regions; the overlay coordinates in `app.js` are designed for a 1024 × 1536 image. If changing the artwork dimensions or layout, update the canvas size and drawing coordinates in `app.js` as well.
