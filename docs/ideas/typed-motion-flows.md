# Typed Motion Flows

Status: Implemented for v2 development

## Problem Statement

React developers often have to assemble several separate systems to build a modal
flow: local state, callback wiring, animation, focus management, scroll locking,
and rules for handling multiple modals. The result is repetitive code with weak
type guarantees around what a modal accepts and what it returns.

How might React Motion Modal let developers express these interactions as typed,
awaitable flows while keeping motion polished, orchestration deterministic, and
the library headless?

## Recommended Direction

Evolve the library from a modal renderer into a small **typed motion flow
engine**. The defining capability is an `open()` call whose input and result are
inferred from the modal registry:

```tsx
type ConfirmInput = {
  title: string;
  description?: string;
};

const confirm = defineModal<ConfirmInput, boolean>({
  component: ConfirmModal,
  preset: motionPresets.dialog(),
  policy: "singleton",
});

export const modals = createModalSystem({ confirm });

function App() {
  return <ModalProvider system={modals} />;
}

const outcome = await modals.open("confirm", {
  title: "Delete this item?",
});

if (outcome.status === "resolved" && outcome.value) {
  await deleteItem();
}
```

Modal components receive their data and lifecycle controls through explicit
namespaces instead of injected flat props:

```tsx
function ConfirmModal({
  input,
  resolve,
  cancel,
}: ModalRenderProps<ConfirmInput, boolean>) {
  return (
    <section>
      <h2>{input.title}</h2>
      <button onClick={() => resolve(true)}>Delete</button>
      <button onClick={() => cancel("programmatic")}>Cancel</button>
    </section>
  );
}
```

### Result model

Cancellation is expected control flow, not an exception. A discriminated result
also allows `undefined` to remain a valid resolved value:

```ts
type ModalOutcome<T> =
  | { status: "resolved"; value: T }
  | {
      status: "cancelled";
      reason:
        | "escape"
        | "backdrop"
        | "programmatic"
        | "replaced"
        | "provider-unmounted";
    };
```

Every `open()` call must settle exactly once, including escape, backdrop,
replacement, programmatic close, and provider unmount paths.

### System model

`createModalSystem()` creates an isolated instance rather than relying on a
process-wide singleton. This gives applications explicit ownership and makes
SSR, tests, multiple roots, and cleanup easier to reason about.

The first orchestration policies are:

- `stack` — add a modal above the current one; this is the default.
- `replace` — cancel the active modal with reason `replaced`, then show the new
  modal.
- `singleton` — if the same modal is already active, reuse its in-flight
  operation instead of creating a duplicate.

Only the top modal is interactive and exposed to assistive technology. Motion
controls presentation, but it must not own or obscure business lifecycle state.

### Motion model

Ship three headless presets that cover the common spatial patterns:

- `dialog` — fade and scale.
- `drawer` — enter from a horizontal edge.
- `sheet` — enter from a vertical edge.

Presets provide sensible enter/exit motion and reduced-motion behavior without
adding colors, shadows, spacing, or other visual styling. Advanced users can
supply custom motion configuration without replacing the lifecycle model.

## Key Assumptions

These assumptions need validation before treating the direction as a v2
commitment:

1. Awaitable flows materially reduce callback and state wiring in confirmation,
   form, and nested-modal examples.
2. `ModalOutcome<T>` is clearer in application code than rejection-based
   cancellation or `T | undefined`.
3. `dialog`, `drawer`, and `sheet` cover most initial motion needs while a custom
   configuration remains a sufficient escape hatch.
4. `stack`, `replace`, and `singleton` cover the important orchestration cases
   without introducing a queue in the first release.
5. An instance-based system is worth the migration cost from the current global
   store.

Validation should include:

- Compile-time tests for registry key, input, and result inference.
- Browser tests for every close path, settle-once behavior, focus restoration,
  scroll locking, reduced motion, and React Strict Mode.
- Three representative examples: confirmation, typed form result, and nested
  stack.
- A side-by-side comparison with the current API to confirm that common flows
  require less application code.

## MVP Scope

The v2 MVP includes:

- `defineModal()` and `createModalSystem()` with inferred input and result types.
- `<ModalProvider system={modals}>` with isolated lifecycle state.
- `modals.open()` returning `Promise<ModalOutcome<T>>`.
- Explicit `resolve()` and `cancel()` component controls.
- `stack`, `replace`, and name-based `singleton` policies.
- Headless `dialog`, `drawer`, and `sheet` motion presets.
- Automatic reduced-motion behavior.
- Focus trapping/restoration, escape handling, portal rendering, and scroll
  locking preserved as core behavior.
- Type, unit, and real-browser coverage for lifecycle invariants.
- A v1-to-v2 migration guide and an Rspress playground for representative
  flows.

A sensible delivery order is:

1. Lock the type contracts and settle-once lifecycle with tests.
2. Move provider state to isolated system instances.
3. Add orchestration policies.
4. Build presets on top of the stable lifecycle.
5. Publish migration documentation and interactive examples.

## Not Doing

- Route-aware or URL-driven modals.
- A queue policy in the initial release.
- A visual design system or default surface styling.
- Drag-to-dismiss gestures in the initial sheet preset; pointer, scrolling, and
  accessibility conflicts need separate validation.
- A general-purpose animation builder.
- Standalone developer tools.
- Maintaining both the global v1 runtime and the instance-based v2 runtime
  indefinitely. Prefer a clear migration guide over two lifecycle models.

## Resolved Questions

1. `open()` settles at close intent; visual teardown may finish afterward.
2. Duplicate `singleton` calls return the exact same in-flight promise.
3. Singleton identity is the modal name for the MVP.
4. Consumers call an imported system directly; no React hook is required.
5. Presets expose a typed Motion configuration as an explicit escape hatch.
6. Calling `open()` before provider mount is supported.
7. Unmounting the last provider cancels pending operations. Provider attachment
   is checked in a microtask so React Strict Mode remounts do not cause false
   cancellation.

The rationale and rejected alternatives are recorded in
`docs/decisions/001-use-instance-based-awaitable-modal-system.md`.
