import { createStore, type StoreApi } from 'zustand/vanilla';
import type {
   AnyModalDefinition,
   ModalCancelReason,
   ModalOpenOptions,
   ModalOutcome,
   ModalRegistry,
   ModalSystem,
} from '../types/modal-system';

export type ActiveModalInstance = {
   id: string;
   name: string;
   input: unknown;
   definition: AnyModalDefinition;
   options?: ModalOpenOptions;
   promise: Promise<ModalOutcome<unknown>>;
   resolve: (value: unknown) => void;
   cancel: (reason?: ModalCancelReason) => void;
};

export type ModalSystemState = {
   activeModals: ActiveModalInstance[];
};

type InternalModalSystem = ModalSystem<ModalRegistry>;
type ModalSystemStore = StoreApi<ModalSystemState>;

type ModalSystemMetadata = {
   store: ModalSystemStore;
   providerCount: number;
};

const metadataBySystem = new WeakMap<object, ModalSystemMetadata>();

const getMetadata = <Registry extends ModalRegistry>(
   system: ModalSystem<Registry>,
): ModalSystemMetadata => {
   const metadata = metadataBySystem.get(system);

   if (!metadata) {
      throw new Error('Invalid modal system instance.');
   }

   return metadata;
};

export const getModalSystemStore = <Registry extends ModalRegistry>(
   system: ModalSystem<Registry>,
): ModalSystemStore => getMetadata(system).store;

export const attachModalProvider = <Registry extends ModalRegistry>(
   system: ModalSystem<Registry>,
): (() => void) => {
   const metadata = getMetadata(system);
   metadata.providerCount += 1;
   let attached = true;

   return () => {
      if (!attached) {
         return;
      }

      attached = false;
      metadata.providerCount -= 1;

      queueMicrotask(() => {
         if (metadata.providerCount === 0) {
            system.cancelAll('provider-unmounted');
         }
      });
   };
};

/**
 * Creates an isolated typed modal registry and lifecycle controller.
 *
 * Each `open()` operation settles exactly once with a resolved or cancelled
 * outcome.
 */
export const createModalSystem = <Registry extends ModalRegistry>(
   registry: Registry,
): ModalSystem<Registry> => {
   const store = createStore<ModalSystemState>(() => ({
      activeModals: [],
   }));
   let nextId = 0;

   const remove = (id: string) => {
      store.setState((state) => ({
         activeModals: state.activeModals.filter((modal) => modal.id !== id),
      }));
   };

   const cancel = (reason: ModalCancelReason = 'programmatic') => {
      const activeModals = store.getState().activeModals;
      activeModals[activeModals.length - 1]?.cancel(reason);
   };

   const cancelAll = (reason: ModalCancelReason = 'programmatic') => {
      const activeModals = [...store.getState().activeModals].reverse();

      for (const modal of activeModals) {
         modal.cancel(reason);
      }
   };

   const system: InternalModalSystem = {
      open(name, input, options) {
         const definition = registry[name];

         if (!definition) {
            throw new Error(`Unknown modal "${name}".`);
         }

         if (definition.policy === 'singleton') {
            const existing = store
               .getState()
               .activeModals.find((modal) => modal.name === name);

            if (existing) {
               return existing.promise;
            }
         }

         if (definition.policy === 'replace') {
            cancel('replaced');
         }

         const id = `${name}-${++nextId}`;
         let settled = false;
         let settlePromise:
            | ((outcome: ModalOutcome<unknown>) => void)
            | undefined;
         const promise = new Promise<ModalOutcome<unknown>>((resolve) => {
            settlePromise = resolve;
         });

         const settle = (outcome: ModalOutcome<unknown>) => {
            if (settled) {
               return;
            }

            settled = true;
            remove(id);
            settlePromise?.(outcome);
         };

         const instance: ActiveModalInstance = {
            id,
            name,
            input,
            definition,
            options,
            promise,
            resolve(value) {
               settle({ status: 'resolved', value });
            },
            cancel(reason = 'programmatic') {
               settle({ status: 'cancelled', reason });
            },
         };

         store.setState((state) => ({
            activeModals: [...state.activeModals, instance],
         }));

         return promise;
      },
      cancel,
      cancelAll,
   };

   metadataBySystem.set(system, {
      store,
      providerCount: 0,
   });

   return system as ModalSystem<Registry>;
};
