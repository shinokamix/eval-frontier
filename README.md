# HP/26

This project collects public benchmark data on how the same AI model performs
across coding-agent harnesses such as Pi, Codex, Claude Code, OpenCode, and Oh
My Pi.

The project does not try to name one "best" agent. It identifies Pareto-optimal
`model × harness` configurations that offer the strongest tradeoffs among task
quality, cost, token usage, and runtime.

The dataset includes only comparable experiments that hold the model and task
set constant while changing the harness. The site lets users explore Pareto
frontiers, compare models and harnesses, and trace each result to its source.

The web app uses React, TypeScript, Vite+, TanStack Router, and Tailwind CSS.

## Data workflow

The raw source intake process is documented in
[`data/README.md`](data/README.md). Later stages will build on immutable source
captures rather than changing published material.

## Run the app locally

1. Install the dependencies:

   ```bash
   vp install
   ```

2. Start the development server:

   ```bash
   vp dev
   ```

If the `vp` command is missing, install Vite+ first:

```bash
curl -fsSL https://vite.plus | bash
```

## Check a change

Run the checks that apply to your change:

```bash
vp check  # check formatting, lint rules, and types
vp build  # create a production build
```

The pre-commit hook runs `vp staged`. This command applies `vp check --fix` to
staged files. To skip the hook for one commit, run:

```bash
VP_GIT_HOOKS=0 git commit
```

## Find the source

- `src/app/main.tsx` mounts the React app and loads the fonts and global styles.
- `src/app/router.tsx` creates the TanStack Router instance.
- `src/app/routes` contains the route files.
- `src/app/routeTree.gen.ts` is the route tree that TanStack Router generates.
- `src/shared/components` contains components shared across routes.

See [`DESIGN.md`](DESIGN.md) for the typography rules and the `Text` component
variants.
