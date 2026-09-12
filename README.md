# harness-pareto

React + TypeScript app on [Vite+](https://viteplus.dev/).

```bash
vp install   # dependencies
vp dev       # dev server
vp check     # format, lint, type-check
vp test      # tests
vp build     # production build
```

`vp` is already on this machine. If it is missing:

```bash
curl -fsSL https://vite.plus | bash
```

Commits run `vp staged`, which is `vp check --fix` on staged files. Skip one commit with `VP_GIT_HOOKS=0`.

Edit `src/App.tsx` and save. HMR updates the page.
