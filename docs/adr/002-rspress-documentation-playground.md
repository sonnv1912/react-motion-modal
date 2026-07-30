# ADR-002: Use Rspress for documentation and the official playground

- Status: Accepted
- Date: 2026-07-30

## Context

The project needs one public site for API documentation, guides, release notes,
and executable examples. The previous Docusaurus site handled documentation
well, but its current project setup did not provide an integrated editable
playground.

The documentation is deployed as a static GitHub Pages project site under
`/react-motion-modal/`. Examples also need to exercise the current workspace
library implementation so the documentation cannot silently drift from the
code.

## Decision

Use Rspress 2 for the documentation application and its official
`@rspress/plugin-playground` package for editable React examples.

- Keep the existing `/react-motion-modal/` base path and `build` output
  directory.
- Preserve the existing `/docs/...` public routes.
- Resolve the playground's `react-motion-modal` import directly to
  `apps/library/src/index.ts`.
- Keep library visual styling out of the structural stylesheet; playground
  examples own their surface styles.
- Build GitHub Pages with a Node version supported by Rspress 2.

## Consequences

- Documentation, search, release notes, and executable examples live in one
  deployable application.
- Playground examples always execute the current workspace source without a
  separate library build.
- Documentation configuration and theme CSS are smaller than the previous
  custom Docusaurus scaffold.
- Rspress and the playground plugin must remain version-aligned.
- The documentation CI runtime must satisfy Rspress's Node engine requirement.
