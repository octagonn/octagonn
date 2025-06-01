# SpyderNet IT Website

This is a React website built with Lovable.dev and configured for GitHub Pages deployment.

## Project info

**Original Lovable URL**: https://lovable.dev/projects/69ed7e4f-099f-4ce2-b3d9-5343a4b6259c

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Automatic Deployment

The site will automatically deploy when you push to the `main` branch. The GitHub Actions workflow will:

1. Build the project
2. Deploy to GitHub Pages
3. Make it available at: `https://[username].github.io/octagonn/`

### Manual Deployment

To manually build for GitHub Pages:

```sh
npm run build:gh-pages
```

### GitHub Pages Setup

To enable GitHub Pages for your repository:

1. Go to your repository's Settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "GitHub Actions"
4. The site will be available at `https://[username].github.io/octagonn/`

## Development

### Local Development

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd octagonn

# Step 3: Install dependencies
npm i

# Step 4: Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:gh-pages` - Build for GitHub Pages deployment
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Editing Options

**Use Lovable**

Visit the [Lovable Project](https://lovable.dev/projects/69ed7e4f-099f-4ce2-b3d9-5343a4b6259c) and start prompting.

**Use your preferred IDE**

Clone this repo and push changes. Changes will be reflected in Lovable.

**Edit directly in GitHub**

Navigate to files and click the "Edit" button (pencil icon).

**Use GitHub Codespaces**

Click "Code" → "Codespaces" → "New codespace" for a cloud development environment.

## Technologies Used

- **Vite** - Build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library with React Router for routing
- **shadcn-ui** - Modern React component library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI components

## GitHub Pages Configuration

This project includes specific configurations for GitHub Pages:

- **Base path configuration** in `vite.config.ts` for subdirectory hosting
- **Router basename** in `App.tsx` for proper navigation
- **404.html** for client-side routing support
- **GitHub Actions workflow** for automatic deployment
- **Redirect script** in `index.html` for SPA routing

## Custom Domain

To connect a custom domain to GitHub Pages:

1. In your repository, go to Settings → Pages
2. Under "Custom domain", enter your domain
3. Create a CNAME file in the root with your domain
4. Configure your DNS provider to point to GitHub Pages

For Lovable projects, you can also use: Project > Settings > Domains in the Lovable interface.
