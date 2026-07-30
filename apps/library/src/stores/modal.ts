import { create } from 'zustand/react';
import type {
   ActiveModal,
   BaseModalParams,
   ModalAction,
   ModalState,
} from '#types/modal';

// biome-ignore lint/suspicious/noEmptyInterface: false
export interface ModalDefinition {}

const createModalId = () => {
   return `modal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const modalStore = create<ModalState & ModalAction>((set, get) => {
   const closeModalAtIndex = (index: number) => {
      const modals = [...get().modals];

      if (index < 0 || index >= modals.length) {
         return;
      }

      const [modal] = modals.splice(index, 1);

      set({
         modals,
         active: modals[modals.length - 1],
      });

      (modal?.params as BaseModalParams | undefined)?.onClose?.();
   };

   return {
      modals: [],

      openModal(name, _params) {
         const id = createModalId();
         const closeModal = () => {
            const index = get().modals.findIndex((modal) => modal.id === id);
            closeModalAtIndex(index);
         };

         const params = {
            ..._params,
            closeModal,
         } as any;

         const modal: ActiveModal = {
            id,
            name,
            params,
         };

         const modals = [...get().modals, modal];

         set({
            modals,
            active: modal,
         });
      },

      closeAllModal() {
         const modals = get().modals;

         set({
            modals: [],
            active: undefined,
         });

         for (const modal of [...modals].reverse()) {
            (modal.params as BaseModalParams | undefined)?.onClose?.();
         }
      },

      closeModal(name) {
         const modals = get().modals;
         const index = name
            ? modals.findIndex((modal) => modal.name === name)
            : modals.length - 1;

         closeModalAtIndex(index);
      },
   };
});
