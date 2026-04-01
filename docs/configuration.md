# Project and Tools Configuration Document
## NPM Scripts
- `npm run build`: Re-compiles all 83 sub-directories into `dist/`.
- `npm test`: Executes the global Jest JSDOM test ecosystem asserting threshold rules.

## Terraform configuration (`variables.tf`)
Cloudflare is synchronized via standard `TF_VAR_cloudflare_api_token` pipelines. The main site domains and routing overrides are handled inside the `terraform/` directory utilizing the `cloudflare_pages_project` resource mapping.

## Analytics Configuration (`build.js` ENV variables)
- `GA_MEASUREMENT_ID`: Sets Google Analytics 4 tracking.
- `ADSENSE_PUB_ID`: Applies Google AdSense scripts conditionally.
- `CF_ANALYTICS_TOKEN`: Cloudflare specific tracking beacon.
