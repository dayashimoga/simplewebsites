const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

const reqDoc = `# Requirements Document
## Functional Requirements
- High-performance utility sites providing standalone offline capabilities via Service Workers.
- Universal "Buy Me a Coffee" button across all 83 web tools for developer support.
- Centralized index page routing to specific, self-contained interactive experiences.
- >90% code coverage threshold across complex and legacy apps before prod-deployment.

## Non-Functional Requirements
- High-efficiency vanilla CSS layout with dynamic theme-toggle compatibility.
- Minimal HTTP requests via bundled JS artifacts with ES Modules optionally loaded.
- Automated CI pipeline on Cloudflare Pages through Terraform.
`;
fs.writeFileSync(path.join(docsDir, 'requirements.md'), reqDoc);

const techArch = `# Technical Architecture Document
## Overview
The platform leverages a scalable Static Site Generation (SSG) architecture custom-built via \`build.js\`, generating purely static HTML, CSS, and JS artifacts that hydrate instantly upon user load.

\`\`\`mermaid
graph TD
    A[Code Repository: Monorepo] -->|npm run build| B(\`shared/build.js\`)
    B -->|Aggregates| C[Global dist/]
    C -->|Deploys to| D{Cloudflare Pages}
    D --> E[End Users]
    
    subgraph "Monorepo Structure"
        F(\`sites/\`) --> B
        G(\`shared/\`) --> B
    end
\`\`\`
`;
fs.writeFileSync(path.join(docsDir, 'technical-architecture.md'), techArch);

const codeTree = `# Code Tree and Explanation
## Structure
\`\`\`
.
├── .github/ workflows
├── .terraform/
├── docs/               # Project documentation
├── shared/             # Global scripts, CSS tokens, build pipeline
│   ├── build.js        # Core custom SSG execution
│   └── theme-toggle.js # Light/Dark mode injection
├── sites/              # 83 localized standalone web tools
│   ├── admin-dashboard/
│   ├── ocean-marine-explorer/
│   ├── fluid-dynamics-lab/
│   └── [...]
├── jest.config.js      # Global >90% threshold enforcing testing suite
└── package.json        # NPM executions (build, test, lint)
\`\`\`
`;
fs.writeFileSync(path.join(docsDir, 'code-tree.md'), codeTree);

const projStat = `# Comprehensive Project Status
## Completed
- Developed 83 high-utility standalone websites with dedicated UI/UX.
- Centralized Cloudflare Pages Terraform configuration and deployment strategy.
- Implemented AST-level Testing mocking methodologies resulting in >90% coverage for 78+ sites.
- Injected global \`Buy Me a Coffee\` button to capture real user tipping.

## Pending & Further Enhancements
- Expand user authentication flow natively inside \`admin-dashboard\`.
- Upgrade to WebAssembly modules for heavy-compute sites (\`fluid-dynamics\`, \`video-compressor\`) vs current polyfill strategies.
- Expand localization (i18n) beyond standard English templates natively into \`build.js\`.
`;
fs.writeFileSync(path.join(docsDir, 'project-status.md'), projStat);

const userGuide = `# Comprehensive User Guide
## Getting Started
Users can access over 83 specialized tools directly through the single Cloudflare index page. 

## Interactions
- **Theme Toggle:** All pages offer a \`🌓\` button at the top-right to override system-default light/dark modes.
- **PWA Capabilities:** The site includes a valid \`sw.js\` service worker. You can install it on your Android, iOS, or Desktop natively.
- **Support Project:** You can securely offer financial tipping by pressing the \`[☕ Support]\` button next to the theme toggle.
`;
fs.writeFileSync(path.join(docsDir, 'user-guide.md'), userGuide);

const codeUnder = `# Project and Code Understanding
## Development Mentality
The monorepo purposely avoids heavy frameworks (React/Vue) in favor of lightning-fast Vanilla Javascript (\`app.js\`), ensuring small bundle sizes and native DOM manipulation.

## Custom Build Flow (\`shared/build.js\`)
Instead of Next.js or Nuxt, the custom builder loops over each folder in \`sites/\`, copies assets, generates XML sitemaps, formats \`manifest.json\`, and dynamically injects the navigation bar via Regex replacing inside \`index.html\`.
`;
fs.writeFileSync(path.join(docsDir, 'code-understanding.md'), codeUnder);

const tsDoc = `# Troubleshooting Technical Document
## Common Issues
### Jest Coverage Threshold Failed
**Symptom**: \`Exit code: 1\` when running \`npm test\` with \`coverage threshold for functions (90%) not met:\`.
**Resolution**: Check \`coverage/lcov-report/index.html\` to identify the missing branches. Typically caused by edge cases inside Canvas math (\`NaN\`) or early return conditions inside DOM event listeners like \`DOMContentLoaded\`.

### Deploy Failure on Cloudflare Pages
**Symptom**: Terraform or Build pipeline aborts.
**Resolution**: Ensure \`npm run build\` successfully executes locally. Verify no file-lock issues or dangling \`dist/\` folders are untracked in git.
`;
fs.writeFileSync(path.join(docsDir, 'troubleshooting.md'), tsDoc);


const confDoc = `# Project and Tools Configuration Document
## NPM Scripts
- \`npm run build\`: Re-compiles all 83 sub-directories into \`dist/\`.
- \`npm test\`: Executes the global Jest JSDOM test ecosystem asserting threshold rules.

## Terraform configuration (\`variables.tf\`)
Cloudflare is synchronized via standard \`TF_VAR_cloudflare_api_token\` pipelines. The main site domains and routing overrides are handled inside the \`terraform/\` directory utilizing the \`cloudflare_pages_project\` resource mapping.

## Analytics Configuration (\`build.js\` ENV variables)
- \`GA_MEASUREMENT_ID\`: Sets Google Analytics 4 tracking.
- \`ADSENSE_PUB_ID\`: Applies Google AdSense scripts conditionally.
- \`CF_ANALYTICS_TOKEN\`: Cloudflare specific tracking beacon.
`;
fs.writeFileSync(path.join(docsDir, 'configuration.md'), confDoc);

console.log('Docs generated successfully.');
