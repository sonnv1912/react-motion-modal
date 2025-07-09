# react-animated-modal

`react-animated-modal` is a flexible modal management library built with [Zustand](https://zustand-demo.pmnd.rs/) for state management and powered by [Framer Motion](https://www.framer.com/motion/) for beautiful animations. It offers full TypeScript type-safety and allows dynamic modal opening with custom parameters.

## ✨ Features

- Stack-based modal management (multiple modals at once)
- Type-safe parameters per modal
- Auto-injection of `closeModal()` into each modal props
- Full intellisense for modal names and parameters
- Easily extensible via module augmentation

## 🧱 Installation

```bash
npm install react-animated-modal
```

or with yarn:

```bash
yarn add react-animated-modal
```

## 🚀 Usage

### 1. Define modal types

Create a `modal.d.ts` file in your project (make sure to include it in tsconfig.json):

```ts
import type { ReactElement } from 'react';
import type { ModalStackParams } from 'react-animated-modal';

declare module 'react-animated-modal' {
  interface ModalStackParams {
    AlertModal: {
        title: string;
    };
    ConfirmModal: {
        onConfirm: () => void;
    };
  }
}
```

### 2. Open modal anywhere

```tsx
import { useModal } from 'react-animated-modal';

const { openModal } = useModal();

openModal('ConfirmModal', {1  
  title: 'Are you sure you want to delete?',
});
```

### 3. Use `closeModal` inside your modal component

```tsx
const ConfirmModal = ({ title, closeModal }: ModalStackParams<'ConfirmModal'>) => (
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

| Prop                    | Type                                | Description                                    |
|-------------------------|-------------------------------------|------------------------------------------------|
| `closeModal`            | `() => void`                        | Close function for the modal                   |
| `closeOnClickOutside`   | `boolean`                           | Close modal when clicking outside              |
| `closeOnPressEsc`       | `boolean`                           | Close modal when Escape key is pressed         |
| `container`             | `{ className?: string; override?: boolean; }` | Customize wrapper styles             |
| `body`                  | `{ className?: string; override?: boolean; }` | Customize inner modal styles          |
| `animate`               | `{ animate?: TargetAndTransition; exit?: TargetAndTransition; }` | Animation powered by Framer Motion. Customize how the modal enters and exits. |
| `onClose`               | `() => void`                        | Callback triggered when modal is closed        |

## 📝 Notes

- Zustand-based, framework-agnostic state management
- Built-in animation system powered by [Framer Motion](https://www.framer.com/motion/)
- You can implement a `ModalRenderer` to dynamically render modals from `activeModals` state
- Great for complex apps requiring nested or dynamic modal stacks

---
Made with ❤️ by react-animated-modal.