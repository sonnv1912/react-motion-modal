# Release Flow

How `react-motion-modal` is versioned and published. This is an internal
reference — the published changelog lives at
`apps/document/docs/docs/changelog.mdx`.

## Model

Releases are **manual and tag-driven**. There is no automated version bump
(no semantic-release, changesets, or release-please). A maintainer bumps the
version, commits a release-prep change, pushes a `v*` tag, and CI publishes.

- **Tag push** (`v*`) → [`publish.yml`](../.github/workflows/publish.yml)
  publishes the library to npm with provenance.
- **`main` push** touching docs/library →
  [`deploy-docs.yml`](../.github/workflows/deploy-docs.yml) rebuilds and
  deploys the Rspress docs site to GitHub Pages.
- **PR / `main` push** → [`ci.yml`](../.github/workflows/ci.yml) runs lint,
  type-check, build, tests, and `npm pack --dry-run` as a quality gate (no
  publish).

## Prerequisites

- `node >= 18`, `yarn` (v1) — see root [`package.json`](../package.json).
- npm trusted publishing must be configured for the `npm` GitHub environment
  (`id-token: write`). No `NODE_AUTH_TOKEN` secret is used.
- Push rights to `main` and the ability to create tags.

## Steps

### 1. Make sure the tree is clean and green

```bash
yarn install --frozen-lockfile
yarn lint
yarn workspace react-motion-modal check-types
yarn workspace react-motion-modal release:check   # test + build + npm pack --dry-run
```

`release:check` is exactly what `publish.yml` runs before publishing — if it
passes locally, CI will pass.

### 2. Bump the version

Pick the bump by what changed (Semver):

- **major** — breaking public API (removed/renamed exports, changed
  signatures). Example: the v2 rewrite (`modalStore` → `createModalSystem`).
- **minor** — new, backwards-compatible features.
- **patch** — bug fixes only.

```bash
yarn workspace react-motion-modal bump:major   # or :minor / :patch
```

These run `yarn version --no-git-tag-version`, so they only edit
`apps/library/package.json` — they do **not** create a git tag.

### 3. Stamp the changelog

In `apps/document/docs/docs/changelog.mdx`, rename the `## Unreleased`
section to the new version with today's date:

```md
## 2.0.0 · 2026-07-30
```

Add a one-line summary under the version heading if helpful. Leave a fresh
`## Unreleased` block above it for next time only if there is pending work.

### 4. Commit the release prep

```bash
git add apps/library/package.json apps/document/docs/docs/changelog.mdx
git commit -m "chore(release): prepare vX.Y.Z"
```

### 5. Tag and push

```bash
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

Pushing the tag triggers `publish.yml`, which runs lint, type-check,
`release:check`, then `npm publish` with provenance. Watch the run:

```
https://github.com/sonnv1912/react-motion-modal/actions/workflows/publish.yml
```

Once it succeeds, the version is live at
`https://www.npmjs.com/package/react-motion-modal`. The docs site badge
(`rspress.config.ts` reads `libraryPackage.version`) updates on the next
`main`-triggered docs deploy.

## Notes & recovery

- **Don't retag.** If a publish fails, fix the issue and cut the next version
  rather than moving an already-pushed tag — npm rejects re-publishing the
  same version, and provenance is bound to the original tag.
- **Docs do not deploy from tags.** The `github-pages` environment blocks
  tag-based deployments, so changelog/doc updates must land on `main`.
- **The example app and docs source are not published.** Only
  `apps/library/dist` ships to npm (see the `files` field).
