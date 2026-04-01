# Technical Architecture Document
## Overview
The platform leverages a scalable Static Site Generation (SSG) architecture custom-built via `build.js`, generating purely static HTML, CSS, and JS artifacts that hydrate instantly upon user load.

```mermaid
graph TD
    A[Code Repository: Monorepo] -->|npm run build| B(`shared/build.js`)
    B -->|Aggregates| C[Global dist/]
    C -->|Deploys to| D{Cloudflare Pages}
    D --> E[End Users]
    
    subgraph "Monorepo Structure"
        F(`sites/`) --> B
        G(`shared/`) --> B
    end
```
