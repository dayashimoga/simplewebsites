# Code Tree and Explanation
## Structure
```
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
```
