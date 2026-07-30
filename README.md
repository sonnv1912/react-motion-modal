# react-motion-modal

[![npm version](https://img.shields.io/npm/v/react-motion-modal)](https://www.npmjs.com/package/react-motion-modal)
[![License](https://img.shields.io/npm/l/react-motion-modal)](https://github.com/sonnv1912/react-motion-modal/blob/main/apps/library/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/react-motion-modal)](https://bundlephobia.com/package/react-motion-modal)

Typed, awaitable modal flows for React, with headless Motion presets and
deterministic orchestration.

Documentation: https://sonnv1912.github.io/react-motion-modal/

## Features

- Input and result types inferred from one registry
- Awaitable `open()` with explicit resolved/cancelled outcomes
- Isolated systems instead of a process-wide singleton
- `stack`, `replace`, and `singleton` policies
- Headless `dialog`, `drawer`, and `sheet` presets
- Focus management, scroll locking, portals, and reduced motion

## Installation

```bash
npm install react-motion-modal motion zustand
```

Import the structural stylesheet once:

```ts
import 'react-motion-modal/style.css';
```

## Quick start

```tsx
import {
  createModalSystem,
  defineModal,
  ModalProvider,
  type ModalRenderProps,
  motionPresets,
} from 'react-motion-modal';

type ConfirmInput = {
  title: string;
};

function ConfirmModal({
  input,
  resolve,
  cancel,
}: ModalRenderProps<ConfirmInput, boolean>) {
  return (
    <section className="dialog">
      <h2>{input.title}</h2>
      <button onClick={() => cancel()}>Cancel</button>
      <button onClick={() => resolve(true)}>Confirm</button>
    </section>
  );
}

const confirm = defineModal({
  component: ConfirmModal,
  preset: motionPresets.dialog(),
  policy: 'singleton',
});

export const modals = createModalSystem({ confirm });

export function App() {
  return (
    <>
      <Routes />
      <ModalProvider
        system={modals}
        defaultOptions={{
          backdrop: {
            style: { backgroundColor: 'rgb(0 0 0 / 40%)' },
          },
        }}
      />
    </>
  );
}
```

Open the modal from application code and await its typed result:

```ts
const outcome = await modals.open('confirm', {
  title: 'Delete this item?',
});

if (outcome.status === 'resolved' && outcome.value) {
  await deleteItem();
}
```

Cancellation resolves with a reason such as `escape`, `backdrop`,
`programmatic`, `replaced`, or `provider-unmounted`; it does not reject.

## Headless styling

The package CSS owns structural positioning and overflow only. Your application
owns backdrop color, surface, spacing, shadow, and typography through
`defaultOptions`, definition defaults, open options, and modal component styles.

## Monorepo

- `apps/library`: published package
- `apps/example`: runnable typed-flow examples
- `apps/document`: Rspress documentation and interactive playground
- `docs/ideas/typed-motion-flows.md`: v2 product direction

See the documentation migration guide when moving from the v1 global store API.
