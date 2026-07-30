# Releasing `react-motion-modal`

This repository publishes the package from `apps/library` through
`.github/workflows/publish.yml`. A pushed `v*` tag starts the npm publishing
workflow.

## Release rules

- Never commit or push unless the maintainer explicitly requests it.
- Never create or push a release tag unless the maintainer explicitly requests
  the npm release.
- Keep implementation, documentation, and release metadata in separate atomic
  commits.
- Do not include unrelated workspace changes in a release commit.
- Do not publish locally. Official releases use GitHub Actions, npm trusted
  publishing, and provenance.

## 1. Flush current code changes

Before changing release metadata:

1. Review the current diff and confirm which files belong to the release.
2. Run the relevant tests, lint, type checks, and builds.
3. Commit the implementation as one or more atomic commits.
4. Push only when explicitly authorized.
5. Confirm the `CI` workflow succeeds on `main`.

Useful checks:

```bash
git status --short
git diff --check
yarn lint
yarn workspace react-motion-modal check-types
yarn workspace react-motion-modal test
yarn workspace react-motion-modal build
```

## 2. Decide whether the library needs a version bump

A version bump and release-note entry are required when a change affects any of
the following:

- runtime code, styles, or public types under `apps/library`
- package metadata, exports, dependencies, or published files
- documented public behavior of `react-motion-modal`
- the npm publishing workflow

Use Semantic Versioning:

- patch: backward-compatible bug fix
- minor: backward-compatible feature or public API addition
- major: breaking public API or behavior change

Changes limited to the example app, documentation infrastructure, or internal
tooling do not require a package version bump unless they alter the published
package or its release process.

## 3. Prepare release metadata

1. Bump `apps/library/package.json` with the matching workspace command:

   ```bash
   yarn workspace react-motion-modal bump:patch
   yarn workspace react-motion-modal bump:minor
   yarn workspace react-motion-modal bump:major
   ```

2. In `apps/document/docs/changelog.mdx`:
   - keep a fresh `Unreleased` section at the top
   - move the pending entries into `<version> · YYYY-MM-DD`
   - describe user-visible changes, not commit history
3. Check that the package version and changelog version match.

Commit the version bump and release notes together:

```bash
git add apps/library/package.json apps/document/docs/changelog.mdx
git commit -m "chore(release): prepare v<version>"
```

## 4. Verify and push the release preparation

Run the full package gate:

```bash
yarn lint
yarn workspace react-motion-modal check-types
yarn workspace react-motion-modal release:check
```

Inspect the package contents reported by `npm pack --dry-run`, then push the
atomic release commits only when authorized:

```bash
git push origin main
```

Wait for `CI` on `main` to succeed before tagging.

## 5. Publish only after explicit approval

Creating the tag is the publish action because it triggers the GitHub Actions
workflow:

```bash
git tag -a v<version> -m "v<version>"
git push origin v<version>
```

Then:

1. Confirm the `Publish` workflow succeeds.
2. Confirm the package version is available on npm.
3. Smoke-test installation from the registry.

Do not reuse or move an existing release tag. npm package versions are
immutable; if a published release is faulty, fix forward with a new patch
version.
