# Project and Code Understanding
## Development Mentality
The monorepo purposely avoids heavy frameworks (React/Vue) in favor of lightning-fast Vanilla Javascript (`app.js`), ensuring small bundle sizes and native DOM manipulation.

## Custom Build Flow (`shared/build.js`)
Instead of Next.js or Nuxt, the custom builder loops over each folder in `sites/`, copies assets, generates XML sitemaps, formats `manifest.json`, and dynamically injects the navigation bar via Regex replacing inside `index.html`.
