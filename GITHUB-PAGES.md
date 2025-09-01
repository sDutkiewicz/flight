# GitHub Pages Deployment

This document contains information about the GitHub Pages deployment of the Flight BPMN Process Editor.

## Public URL

The application is deployed at:

```
https://sdutkiewicz.github.io/flight/
```

## Repository Structure for GitHub Pages

The GitHub Pages deployment uses the following structure:

- The source code is in the `main` branch
- The GitHub Actions workflow builds and deploys the application from the `bpmn-app` directory
- The built files are served from the `gh-pages` branch (managed automatically by GitHub Actions)

## Making Changes

To update the deployed application:

1. Make your changes to the code
2. Commit and push to the `main` branch
3. GitHub Actions will automatically build and deploy the updated application

## Local Development vs. Deployed Version

There are a few differences between local development and the deployed version:

1. Base Path: 
   - Local development: `/` (root)
   - GitHub Pages: `/flight/`

2. Asset URLs:
   - All asset URLs (images, etc.) are prefixed with `/flight/` in the deployed version
   - This is handled automatically by Vite's `base` configuration

## Custom Domain (Optional)

If you want to use a custom domain instead of `sdutkiewicz.github.io/flight`:

1. Go to repository Settings > Pages
2. Under "Custom domain", enter your domain (e.g., `bpmn.example.com`)
3. Update DNS settings with your domain provider
4. Update the `base` in `vite.config.js` to `'/'` instead of `/flight/`
