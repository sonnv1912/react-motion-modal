# ADR-001: Use an Instance-Based Awaitable Modal System

## Status

Accepted

## Date

2026-07-30

## Context

The v1 API combined business input, rendering options, and an injected close
callback in a process-wide Zustand store. Module augmentation supplied name
types, but a modal could not express a typed result. Applications therefore
needed callback wiring and extra state for confirmation, form, and nested modal
flows.

The v2 direction requires:

- typed input and output from one registry;
- deterministic stack, replacement, and duplicate behavior;
- SSR and test isolation;
- explicit cancellation semantics;
- motion that does not control business lifecycle state.

## Decision

Create each registry with `createModalSystem()` and pass that instance to
`ModalProvider`.

`open()` returns `Promise<ModalOutcome<Result>>`. Resolution and cancellation
settle the promise at close intent exactly once; exit animation may finish
afterward. Cancellation is a discriminated outcome with a source reason, not a
rejected promise.

Modal components receive `{ input, resolve, cancel }`. Rendering and interaction
options are a separate third argument to `open()`.

The initial policies are:

- `stack`: append a new instance;
- `replace`: cancel the current top instance with `replaced`;
- `singleton`: return the exact existing promise for the same modal name.

Provider state is isolated per system. Calling `open()` before mount is valid.
Unmounting the last provider cancels pending operations with
`provider-unmounted`; a microtask attachment check prevents React Strict Mode
remounts from causing false cancellation.

## Alternatives Considered

### Keep the v1 global singleton

Rejected because it couples unrelated roots, complicates SSR/test cleanup, and
cannot infer a result contract from a registry instance.

### Reject promises on cancellation

Rejected because Escape, backdrop click, and replacement are expected control
flow. A discriminated outcome also keeps `undefined` available as a valid
resolved value.

### Return `Result | undefined`

Rejected because it cannot distinguish cancellation sources and makes
`undefined` ambiguous.

### Hide the system behind a React hook

Rejected as the only access path because flows often start outside React
components. Direct system imports work in either environment; a convenience
hook can be added later without changing the core contract.

## Consequences

- v2 is intentionally breaking and does not retain the v1 runtime singleton.
- Consumers must own and mount a system instance.
- Every close path must preserve the settle-once invariant.
- Registry keys, inputs, and results are inferred without module augmentation.
- Multiple systems can coexist without sharing stacks.
- Name-based singleton behavior is deliberately simple; keyed singleton and
  queues remain future extensions.
