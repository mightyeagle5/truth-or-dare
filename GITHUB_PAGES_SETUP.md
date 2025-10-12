# GitHub Pages Deployment Setup

This project is configured to automatically deploy to GitHub Pages.

## 🚀 Automatic Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

**Live URL:** `https://mightyeagle5.github.io/truth-or-dare/`

## 📋 What's Been Set Up

### 1. **Vite Configuration** (`vite.config.ts`)
- Added `base: '/truth-or-dare/'` to ensure assets load correctly on GitHub Pages

### 2. **Deploy Scripts** (`package.json`)
- `npm run predeploy` - Builds the project
- `npm run deploy` - Deploys the `dist` folder to GitHub Pages (manual deployment)

### 3. **GitHub Actions** (`.github/workflows/deploy.yml`)
- Automatically builds and deploys on every push to `main`
- Can also be triggered manually from the Actions tab

### 4. **Jekyll Prevention** (`public/.nojekyll`)
- Prevents GitHub from processing the site with Jekyll

## 🔧 First-Time GitHub Pages Setup

You need to configure GitHub Pages in your repository settings **once**:

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Save the settings

That's it! The next push to `main` will automatically deploy your site.

## 📦 Manual Deployment (Optional)

If you prefer to deploy manually instead of using GitHub Actions:

```bash
npm run deploy
```

This will build and push the site to the `gh-pages` branch.

## 🌐 Accessing Your Site

After deployment, your site will be available at:
- **Production:** `https://mightyeagle5.github.io/truth-or-dare/`

## 🔄 How It Works

1. You push code to `main` branch
2. GitHub Actions workflow triggers
3. Workflow installs dependencies and builds the project
4. Built files from `dist/` folder are deployed to GitHub Pages
5. Site is live at the URL above (usually takes 1-2 minutes)

## 🛠️ Troubleshooting

### Blank Page / 404 Errors
- Make sure `base: '/truth-or-dare/'` is set in `vite.config.ts`
- Check that GitHub Pages is configured to use "GitHub Actions" as source

### Assets Not Loading
- Verify the base path matches your repository name
- Check browser console for 404 errors

### Deployment Fails
- Check the Actions tab for error logs
- Ensure all dependencies are in `package.json`
- Verify the build runs locally: `npm run build`

## 📝 Notes

- The `.nojekyll` file is automatically included in the build
- Environment variables should be prefixed with `VITE_` to be accessible
- For custom domain setup, add a `CNAME` file to the `public/` folder

