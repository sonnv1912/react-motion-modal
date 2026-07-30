# react-motion-modal

Typed, awaitable modal flows for React, with headless Motion presets and
deterministic orchestration.

## Installation

```bash
npm install react-motion-modal motion zustand
```

```ts
import 'react-motion-modal/style.css';
```

## Usage

```tsx
import {
  createModalSystem,
  defineModal,
  ModalProvider,
  type ModalRenderProps,
  motionPresets,
} from 'react-motion-modal';

type ConfirmInput = { title: string };

function ConfirmModal({
  input,
  resolve,
  cancel,
}: ModalRenderProps<ConfirmInput, boolean>) {
  return (
    <section>
      <h2>{input.title}</h2>
      <button onClick={() => cancel()}>Cancel</button>
      <button onClick={() => resolve(true)}>Confirm</button>
    </section>
  );
}

const modals = createModalSystem({
  confirm: defineModal({
    component: ConfirmModal,
    preset: motionPresets.dialog(),
    policy: 'singleton',
  }),
});

export function App() {
  return <ModalProvider system={modals} />;
}
```

```ts
const outcome = await modals.open('confirm', {
  title: 'Delete this item?',
});

if (outcome.status === 'resolved' && outcome.value) {
  await deleteItem();
}
```

## API

- `defineModal()` binds a component to its input, result, preset, defaults, and
  policy.
- `createModalSystem()` creates an isolated registry and stack.
- `system.open()` returns `Promise<ModalOutcome<Result>>`.
- `system.cancel()` cancels the active modal.
- `system.cancelAll()` cancels the full stack.
- `ModalProvider` handles portal rendering, focus, Escape, backdrop
  cancellation, scroll lock, and provider cleanup.
- `motionPresets.dialog()`, `.drawer()`, and `.sheet()` provide headless motion.

Policies are `stack` (default), `replace`, and `singleton`.

The stylesheet contains structural layout only. Applications own all visual
styling.

Full documentation: https://sonnv1912.github.io/react-motion-modal/
