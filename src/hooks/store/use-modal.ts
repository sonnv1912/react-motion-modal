import { v4 } from 'uuid';
import { create } from 'zustand/react';
import type { ActiveModal, ModalAction, ModalState } from '#types/modal.type';

// biome-ignore lint/suspicious/noEmptyInterface: false
export interface ModalDefinition {}

export const useModal = create<ModalState & ModalAction>((set, get) => ({
   activeModals: [],

   openModal(name, _params) {
      const closeModal = () => get().closeModal(name);

      const params = {
         ..._params,
         closeModal,
      } as any;

      const modal: ActiveModal = {
         id: v4(),
         name,
         params,
      };

      const activeModals = [...get().activeModals, modal];

      set({
         activeModals,
      });
   },

   closeAllModal() {
      set({
         activeModals: [],
      });
   },

   closeModal(name) {
      const activeModals = [...get().activeModals];

      if (name) {
         const foundIndex = activeModals.findIndex((t) => t.name === name);
         const modal = activeModals[foundIndex];
         const params = modal.params;

         if (foundIndex !== -1) {
            params?.onClose?.();

            activeModals.splice(foundIndex, 1);
         }
      } else {
         const modal = activeModals[activeModals.length - 1];
         const params = modal.params;

         params?.onClose?.();

         activeModals.pop();
      }

      set({
         activeModals,
      });
   },
}));
