# react-motion-modal

[![npm version](https://img.shields.io/npm/v/react-motion-modal)](https://www.npmjs.com/package/react-motion-modal)
[![npm downloads](https://img.shields.io/npm/dm/react-motion-modal)](https://www.npmjs.com/package/react-motion-modal)
[![License](https://img.shields.io/npm/l/react-motion-modal)](https://github.com/sonnv1912/react-motion-modal/blob/main/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/react-motion-modal)](https://bundlephobia.com/package/react-motion-modal)
[![TypeScript types](https://img.shields.io/npm/types/react-motion-modal)](https://www.npmjs.com/package/react-motion-modal)
[![Node version](https://img.shields.io/node/v/react-motion-modal)](https://www.npmjs.com/package/react-motion-modal)
[![GitHub issues](https://img.shields.io/github/issues/sonnv1912/react-motion-modal)](https://github.com/sonnv1912/react-motion-modal/issues)
[![Socket](https://socket.dev/api/badge/npm/package/react-motion-modal)](https://socket.dev/npm/package/react-motion-modal)

`react-motion-modal` is a flexible modal management library built with [Zustand](https://zustand-demo.pmnd.rs/) for state management and powered by [Framer Motion](https://www.framer.com/motion/) for beautiful animations. It offers full TypeScript type-safety and allows dynamic modal opening with custom parameters.

## ✨ Features

- Stack-based modal management (multiple modals at once)
- Type-safe parameters per modal
- Auto-injection of `closeModal()` into each modal props
- Full intellisense for modal names and parameters
- Easily extensible via module augmentation

## 🧱 Installation

```bash
npm install react-motion-modal motion zustand
```

or with yarn:

```bash
yarn add react-motion-modal motion zustand
```

## 🚀 Usage

### 1. Import styles

Import the package stylesheet once in your app entry:

```ts
import 'react-motion-modal/style.css';
```

### 2. Define modal types

Create a `modal.d.ts` file in your project (make sure to include it in tsconfig.json):

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

### 3. Import <ModalProvider />

Import <ModalProvider /> to define your modals

```ts
import { ModalProvider } from 'react-motion-modal';

export const App = () => {
   return (
      <div>
         {/* rest of your app */}

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

### 4. Open modal anywhere

```tsx
import { MODAL_POSITIONS, useModal } from 'react-motion-modal';

const { openModal } = useModal();

openModal('ConfirmModal', {
   title: 'Are you sure you want to delete?',
   position: MODAL_POSITIONS.RIGHT,
   closeOnClickOutside: true,
});
```

### 5. Use `closeModal` inside your modal component

```tsx
import type { ModalParams } from 'react-motion-modal';

const ConfirmModal = ({ title, closeModal }: ModalParams<'ConfirmModal'>) => (
   <div>
      <h1>{title}</h1>
      <button onClick={closeModal}>Close</button>
   </div>
);
```

## 🧩 API

### `openModal(name, params)`

Opens a modal by name. The `params` will be inferred based on modal type.

### `closeModal(name?)`

- If `name` is provided, closes that specific modal.
- If not, closes the most recent modal (top of the stack).

### `BaseModalParams`

Each modal automatically receives the following props:

| Prop                  | Type                                                             | Description                                                                   |
|-----------------------|------------------------------------------------------------------|-------------------------------------------------------------------------------|
| `closeModal`          | `() => void`                                                     | Close function for the modal                                                  |
| `onClose`             | `() => void`                                                     | Callback triggered when modal is closed                                       |
| `closeOnClickOutside` | `boolean`                                                        | Close modal when clicking outside                                             |
| `closeOnPressEsc`     | `boolean`                                                        | Close modal when Escape key is pressed                                        |
| `position`            | `string`                                                         | Modal placement. Unknown values fall back to `center`.                         |
| `backdrop`            | `{ className?: string; style?: CSSProperties; }`                 | Customize the backdrop layer                                                  |
| `body`                | `{ className?: string; style?: CSSProperties; }`                 | Customize the modal body wrapper                                              |
| `animate`             | `{ animate?: TargetAndTransition; exit?: TargetAndTransition; }` | Animation powered by Framer Motion. Custom animation disables defaults.        |
| `blur`                | `boolean`                                                        | Apply backdrop blur                                                           |

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

Default body animation follows the position. For example, `left` slides in from the left, `right` slides in from the right, `top` slides down, and `bottom` slides up.

## 🔐 Release Security

- CI runs from `.github/workflows/ci.yml` on pushes and pull requests.
- npm publishing is defined in `.github/workflows/publish.yml` and uses `npm publish --provenance --access public`.
- Trusted publishing still needs to be enabled in npm package settings for this repository before the workflow can publish official releases.

## 📝 Notes

- Zustand-based, framework-agnostic state management
- Built-in animation system powered by [Framer Motion](https://www.framer.com/motion/)
- You can implement a `ModalRenderer` to dynamically render modals from `modals` state
- Great for complex apps requiring nested or dynamic modal stacks

---
Made with ❤️ by react-motion-modal.
