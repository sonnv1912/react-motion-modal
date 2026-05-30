# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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