# Harness Pareto

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

## Research methodology

[`METHODOLOGY.md`](METHODOLOGY.md) documents the planned cross-study analysis:
task families, local rankings, Plackett-Luce or Bradley-Terry estimation,
weighted global scores, Pareto fronts, and reliability reporting. It also marks
which parts are not implemented yet.

## Data workflow

The data pipeline is documented in [`data/README.md`](data/README.md). To
capture a source or add one to the build, see
[`data/add-a-source.md`](data/add-a-source.md). Capture, extract, and harmonize
run for `kroda-coding-agent-baselines` and write `data/build/research.json`. The
site still reads `public/data/research.json`.

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
