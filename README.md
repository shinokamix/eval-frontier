# harness-pareto

React + TypeScript app on [Vite+](https://viteplus.dev/), with TanStack Router
file-based routing.

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

Commits run `vp staged`, which is `vp check --fix` on staged files. Skip one
commit with `VP_GIT_HOOKS=0`.

Source layout:

- `src/app` bootstrap, router, global styles, pages as route files
- `src/modules` domain code (charts and other product slices)
- `src/shared` reused `components`, `hooks`, `types`

Routes live in `src/app/routes`. TanStack Router generates
`src/app/routeTree.gen.ts` from those files.
