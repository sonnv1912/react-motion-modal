# Documentation website

The documentation and interactive playground are built with
[Rspress](https://rspress.dev/).

## Installation

```bash
yarn install
```

## Local development

```bash
yarn workspace document dev
```

Rspress watches the documentation, theme, and library source. The playground
loads `apps/library/src` directly, so examples always run against the current
workspace implementation.

## Build

```bash
yarn workspace document build
```

Static output is generated in `apps/document/build`.

## Deployment

`.github/workflows/deploy-docs.yml` builds and publishes the site to GitHub
Pages when documentation changes land on `main`, or when the workflow is
started manually.
