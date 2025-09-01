# Deployment Guide: GitHub Pages

This document explains how to deploy the Flight BPMN Process Editor to GitHub Pages.

## Automatic Deployment with GitHub Actions

The project is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

### How It Works

1. The GitHub Actions workflow (`.github/workflows/deploy.yml`) is triggered whenever:
   - Changes are pushed to the `main` branch
   - The workflow is manually triggered from the GitHub Actions tab

2. The workflow:
   - Checks out the code
   - Sets up Node.js
   - Installs dependencies with `npm ci`
   - Builds the project with `npm run build`
   - Deploys the `dist` folder to GitHub Pages

### First-Time Setup

To set up GitHub Pages deployment for the first time:

1. Go to your GitHub repository (`https://github.com/sDutkiewicz/flight`)
2. Navigate to **Settings** > **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push a commit to the `main` branch to trigger the workflow

### Manual Deployment

If you need to manually trigger a deployment:

1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. Select the **Deploy to GitHub Pages** workflow
4. Click **Run workflow** and select the branch (usually `main`)

## Accessing the Deployed Application

Once deployed, your application will be available at:

```
https://sdutkiewicz.github.io/flight/
```

## Troubleshooting

If the deployment fails:

1. Check the GitHub Actions logs for errors
2. Verify that the `base` path in `vite.config.js` matches your repository name
3. Ensure all dependencies are correctly installed
4. Check for any build errors by running `npm run build` locally

## Local Preview of Production Build

To preview the production build locally (exactly as it will appear on GitHub Pages):

```bash
cd bpmn-app
npm run build
npm run preview -- --base=/flight/
```

This will serve the production build locally, usually at `http://localhost:4173/flight/`.
