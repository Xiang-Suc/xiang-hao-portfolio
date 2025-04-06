# Xiang Hao's Portfolio Website

A modern, responsive personal portfolio website with a tech theme, featuring a clean design with Ferrari red and Lamborghini yellow accents. This portfolio showcases my skills, projects, experience, and education to potential employers and recruiters.

## Live Website

Visit my portfolio: [xianghao.dev](https://xiang-suc.github.io/xiang-hao-portfolio/)

## Features

- Responsive design that works on all devices
- Interactive UI with animations and transitions
- Custom cursor effects
- Dynamic project filtering
- Tech-themed background with particle effects
- Typewriter text effect
- Contact form
- Smooth scrolling and section highlighting

## Tech Stack

- HTML5
- CSS3 (with modern features like CSS Grid, Flexbox, and CSS Variables)
- Vanilla JavaScript (ES6+)
- Font Awesome icons
- Google Fonts

## Project Structure

```
portfolio/
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── images/
│   ├── IMG_0422.jpg
│   ├── time-tracker.png
│   ├── safety-detection-system.png
│   ├── Dataset-json-viewer.png
│   ├── The_University_of_California_Davis.svg.png
│   ├── oregon-logo.png
│   ├── AWS.png
│   └── tech-grid.svg
├── CNAME
├── index.html
└── README.md
```

## CI/CD Workflow

This project uses GitHub Actions for continuous integration and deployment. The workflow is configured to automatically build and deploy the website to GitHub Pages whenever changes are pushed to the `main` branch.

### How It Works

1. **Automatic Triggers**: 
   - When code is pushed to the `main` branch
   - When manually triggered through GitHub Actions interface

2. **Build Process**:
   - Checks out the latest code
   - Sets up GitHub Pages environment
   - Performs any necessary build steps
   - Uploads the build artifacts

3. **Deployment**:
   - Automatically deploys to GitHub Pages
   - Updates the live website with the latest changes

### Local Development

To work on this website locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/Xiang-Suc/xiang-hao-portfolio.git
   cd xiang-hao-portfolio
   ```

2. Make your changes to the HTML, CSS, or JavaScript files

3. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

4. The GitHub Actions workflow will automatically build and deploy your changes

### Workflow Status

You can check the status of the workflow in the Actions tab of the GitHub repository.

## Deployment

This website is deployed using GitHub Pages. To deploy your own version:

1. Fork this repository
2. Go to repository Settings > Pages
3. Select the branch you want to deploy (usually `main`)
4. Choose the root folder for deployment
5. Click Save

If you want to use a custom domain:
1. Add your domain in the GitHub Pages settings
2. Create/update the `CNAME` file with your domain
3. Configure your DNS settings with your domain provider

## Customization

### Updating Your Information

1. Edit `index.html` to update your personal details, experience, projects, and education
2. Replace the images in the `images` folder with your own
3. Modify the styling in `css/styles.css` if desired

## License

This project is open source and available under the [MIT License](LICENSE). 