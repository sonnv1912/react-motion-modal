# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Renamed store and provider entrypoints to `src/stores/modal.ts` and `src/providers/modal.tsx`, and updated public exports accordingly.
- Renamed type files to shorter names such as `base-modal-params.ts`, `modal-components.ts`, and `modal-state.ts`.
- Removed the bundled example app source from `src/example` and the unused example stylesheet from the package source.
- Extracted modal class-name and body animation helpers into `src/utils`, and moved modal animation constants and z-index constants into `src/configs/constant.ts`.
- Replaced `uuid`, `keyboardjs`, and `clsx` usage with built-in JavaScript and DOM APIs, removing those packages from runtime dependencies.
- Updated the README install note and examples to reflect the current `modalStore` API and peer dependency expectations.

## [1.2.8] - 2026-06-01

### Added
- Added GitHub Actions workflows for CI and npm publishing with provenance.
- Added a `SECURITY.md` policy and an MIT `LICENSE` file to document release and security expectations.
- Added `release:check` and `ci` scripts to validate release artifacts and CI builds consistently.
- Added npm, bundle, type, issue, and Socket badges to the README.

### Changed
- Documented the trusted publishing release flow in the README.
- Replaced the manual local publish script with a CI-oriented release verification script.

## [1.2.6] - 2026-05-31

### Changed
- Removed Tailwind CSS and the Tailwind Vite plugin from package dependencies.
- Replaced the example app Tailwind utilities with plain CSS classes.
- Moved modal default layout to `main.css` with zero-specificity selectors so consumer classes can override defaults without `!important`.
- Added modal positions: `top`, `top-left`, `top-right`, `top-center`, `left`, `right`, `bottom`, `bottom-left`, `bottom-right`, `bottom-center`, `center`, and `center-full`.
- Added default position-aware body animations for edge and corner placements.

## [1.2.5] - 2026-05-30

### Fixed
- Removed Tailwind CSS injection from the distributed library build.
- Moved Tailwind CSS import to the example app only.
- Replaced internal modal layout Tailwind classes with inline styles to avoid overriding consumer app utilities.

## [1.2.4] - 2025-05-30

### Changed
- Split `modal.type.ts` into separate files for better maintainability
- `base-modal-params.type.ts` – base modal parameter types
- `modal-components.type.ts` – modal component and config types
- `modal-state.type.ts` – modal state and action types
- `modal.type.ts` now re-exports all types (backward compatible)
- Bumped dependencies (motion, zustand, vite, tailwindcss, biome, playwright, etc.)

## [1.2.3] - 2025-05-30

### Fixed
- Fixed `ModalParams` type to correctly extend `ModalDefinition[T]` with `closeModal`
- Dependency updates for stability

## [1.2.2] - 2025-11-21

### Added
- Enhanced TypeScript documentation with comprehensive JSDoc comments
- More detailed examples for modal animations and positioning
- Better documentation for blur effect parameter
- Comprehensive examples for ModalComponent and ModalConfig types

### Changed
- Improved type documentation with real-world usage examples
- Enhanced Framer Motion animation configuration documentation
- Better documentation for modal positioning options

### Fixed
- Type definitions now properly import required dependencies
- Documentation examples updated to reflect current API

## [1.1.9]
### Added
- Responsive design improvements
- Better modal stacking behavior

### Fixed
- Modal closing logic issues
- CSS rendering problems

## [1.1.8]
### Added
- Streamlined modal closing logic
- Performance optimizations

### Removed
- Unused CSS styles

## [1.1.7]
### Fixed
- Bug fixes and stability improvements

## [Previous Versions]

For versions prior to 1.1.7, please refer to the git commit history.
