# SpyderNet IT Website

This repository contains the website for SpyderNet IT, a professional IT services company.

## Overview

The website is built using HTML, CSS, and JavaScript, making it lightweight and easily deployable on any web hosting service, including GitHub Pages.

## Structure

- `index.html` - Homepage
- `services.html` - IT Services offered
- `about.html` - About the company
- `contact.html` - Contact information and form
- `css/style.css` - Main stylesheet
- `js/script.js` - JavaScript functionality
- `img/` - Directory for images (not included in this repository)

## Setup

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/spydernetit.git
   ```
2. Open any of the HTML files in your web browser to view the site locally.

### Deployment on GitHub Pages

1. Go to your repository settings on GitHub.
2. Scroll down to the "GitHub Pages" section.
3. Select the branch you want to deploy (usually `main` or `master`).
4. Click "Save".
5. Your site will be available at `https://yourusername.github.io/repository-name/`

### Custom Domain Setup

To connect your GoDaddy domain (spydernetit.com) to GitHub Pages:

1. In your GitHub repository, go to Settings > Pages.
2. Under "Custom domain", enter your domain name `spydernetit.com` and click Save.
3. In your GoDaddy account:
   - Go to your domain's DNS management page.
   - Add the following A records to point to GitHub's servers:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Add a CNAME record with:
     - Name: www
     - Value: yourusername.github.io
4. Wait for DNS changes to propagate (can take up to 48 hours).

## Images

The website design references several images that should be placed in the `img/` directory:
- `hero-bg.jpg` - Background for hero sections
- `about.jpg` - Image for the about section on homepage
- `about-main.jpg` - Main image for the about page
- `managed-it.jpg` - Image for managed IT services
- `cybersecurity.jpg` - Image for cybersecurity services
- `cloud-services.jpg` - Image for cloud services
- `network-infrastructure.jpg` - Image for network infrastructure
- `team-1.jpg`, `team-2.jpg`, `team-3.jpg`, `team-4.jpg` - Team member images

## Customization

To customize the website:
1. Replace placeholder text with your actual company information
2. Add your own images to the `img/` directory
3. Update contact information and social media links
4. Adjust colors and styling in the CSS file as needed

## License

All rights reserved. This is a proprietary website for SpyderNet IT. 