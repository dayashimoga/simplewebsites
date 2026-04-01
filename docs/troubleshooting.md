# Troubleshooting Technical Document
## Common Issues
### Jest Coverage Threshold Failed
**Symptom**: `Exit code: 1` when running `npm test` with `coverage threshold for functions (90%) not met:`.
**Resolution**: Check `coverage/lcov-report/index.html` to identify the missing branches. Typically caused by edge cases inside Canvas math (`NaN`) or early return conditions inside DOM event listeners like `DOMContentLoaded`.

### Deploy Failure on Cloudflare Pages
**Symptom**: Terraform or Build pipeline aborts.
**Resolution**: Ensure `npm run build` successfully executes locally. Verify no file-lock issues or dangling `dist/` folders are untracked in git.
