# TODO: Fix Netlify Deploy and Runtime Issues

- [x] Update package.json to add @netlify/plugin-nextjs as dev dependency
- [x] Edit netlify.toml to remove publish = "out" and add plugin configuration
- [x] Install the new dependency using npm install --save-dev @netlify/plugin-nextjs
- [ ] Clear the publish directory in Netlify UI (set to empty, not repo root)
- [ ] Commit and push the changes to the repository
- [ ] Trigger a new deploy on Netlify
- [x] Fix infinite scroll API calls in app/page.tsx to prevent loops and handle errors
