# react-motion-modal

[![npm version](https://img.shields.io/npm/v/react-motion-modal)](https://www.npmjs.com/package/react-motion-modal)
[![npm downloads](https://img.shields.io/npm/dm/react-motion-modal)](https://www.npmjs.com/package/react-motion-modal)
[![License](https://img.shields.io/npm/l/react-motion-modal)](https://github.com/sonnv1912/react-motion-modal/blob/main/apps/library/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/react-motion-modal)](https://bundlephobia.com/package/react-motion-modal)
[![TypeScript types](https://img.shields.io/npm/types/react-motion-modal)](https://www.npmjs.com/package/react-motion-modal)
[![Node version](https://img.shields.io/node/v/react-motion-modal)](https://www.npmjs.com/package/react-motion-modal)
[![GitHub issues](https://img.shields.io/github/issues/sonnv1912/react-motion-modal)](https://github.com/sonnv1912/react-motion-modal/issues)
[![Socket](https://socket.dev/api/badge/npm/package/react-motion-modal)](https://socket.dev/npm/package/react-motion-modal)

`react-motion-modal` is a flexible modal management library built with [Zustand](https://zustand-demo.pmnd.rs/) for state management and powered by [Framer Motion](https://www.framer.com/motion/) for animations.

Documentation: https://sonnv1912.github.io/react-motion-modal/

## Features

- Stack-based modal management
- Type-safe parameters per modal
- Auto-injection of `closeModal()` into modal props
- Full IntelliSense for modal names and parameters
- Position-aware default animations

## Installation

```bash
npm install react-motion-modal motion zustand
```

or:

```bash
yarn add react-motion-modal motion zustand
```

`react` and `react-dom` are expected to already exist in your app.

## Usage

### 1. Import styles

```ts
import 'react-motion-modal/style.css';
```

### 2. Define modal types

```ts
import type { ModalDefinition } from 'react-motion-modal';

declare module 'react-motion-modal' {
  interface ModalDefinition {
    AlertModal: {
      title: string;
    };
    ConfirmModal: {
      onConfirm: () => void;
    };
  }
}
```

### 3. Mount `ModalProvider`

```tsx
import { ModalProvider } from 'react-motion-modal';

export const App = () => {
  return (
    <div>
      <ModalProvider
        modals={{
          AlertModal,
          ConfirmModal,
        }}
      />
    </div>
  );
};
```

### 4. Open a modal

```tsx
import { MODAL_POSITIONS, modalStore } from 'react-motion-modal';

const { openModal } = modalStore();

openModal('ConfirmModal', {
  title: 'Are you sure you want to delete?',
  position: MODAL_POSITIONS.RIGHT,
  closeOnClickOutside: true,
});
```

### 5. Use `closeModal` inside a modal

```tsx
import type { ModalParams } from 'react-motion-modal';

const ConfirmModal = ({ title, closeModal }: ModalParams<'ConfirmModal'>) => (
  <div>
    <h1>{title}</h1>
    <button onClick={closeModal}>Close</button>
  </div>
);
```

## API

### `openModal(name, params)`

Opens a modal by name. The `params` type is inferred from the modal definition.

### `closeModal(name?)`

- If `name` is provided, closes that specific modal.
- If not, closes the most recent modal.

### `BaseModalParams`

Each modal automatically receives:

| Prop                  | Type                                                             | Description                                                            |
|-----------------------|------------------------------------------------------------------|------------------------------------------------------------------------|
| `closeModal`          | `() => void`                                                     | Close function for the modal                                           |
| `onClose`             | `() => void`                                                     | Callback triggered when the modal closes                               |
| `closeOnClickOutside` | `boolean`                                                        | Close modal when clicking outside                                      |
| `closeOnPressEsc`     | `boolean`                                                        | Close modal when Escape is pressed                                     |
| `position`            | `string`                                                         | Modal placement. Unknown values fall back to `center`.                 |
| `backdrop`            | `{ className?: string; style?: CSSProperties }`                  | Customize the backdrop layer                                           |
| `body`                | `{ className?: string; style?: CSSProperties }`                  | Customize the modal body wrapper                                       |
| `animate`             | `{ animate?: TargetAndTransition; exit?: TargetAndTransition }`  | Motion config. Custom animation disables the built-in position default |
| `blur`                | `boolean`                                                        | Apply backdrop blur                                                    |

### `MODAL_POSITIONS`

```ts
MODAL_POSITIONS.TOP;
MODAL_POSITIONS.TOP_LEFT;
MODAL_POSITIONS.TOP_RIGHT;
MODAL_POSITIONS.TOP_CENTER;
MODAL_POSITIONS.LEFT;
MODAL_POSITIONS.RIGHT;
MODAL_POSITIONS.CENTER;
MODAL_POSITIONS.CENTER_FULL;
MODAL_POSITIONS.BOTTOM;
MODAL_POSITIONS.BOTTOM_LEFT;
MODAL_POSITIONS.BOTTOM_RIGHT;
MODAL_POSITIONS.BOTTOM_CENTER;
```

Default animation follows the selected position.

## Release Security

- CI runs from `.github/workflows/ci.yml`.
- npm publishing is defined in `.github/workflows/publish.yml`.
- Docs deploy to GitHub Pages from `.github/workflows/deploy-docs.yml`.

## Monorepo

- `apps/library`: published npm package
- `apps/document`: Docusaurus documentation site
- `packages/typescript-config`: shared TypeScript configs
