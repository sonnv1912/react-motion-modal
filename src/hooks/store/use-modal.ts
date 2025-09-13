import { v4 } from 'uuid';
import { create } from 'zustand/react';
import type { ActiveModal, ModalAction, ModalState } from '#types/modal.type';

// biome-ignore lint/suspicious/noEmptyInterface: false
export interface ModalDefinition {}

export const useModal = create<ModalState & ModalAction>((set, get) => ({
   modals: [],

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

      const modals = [...get().modals, modal];

      set({
         modals,
         active: modal,
      });
   },

   closeAllModal() {
      set({
         modals: [],
         active: undefined,
      });
   },

   closeModal(name) {
      const modals = [...get().modals];

      const foundIndex = name
         ? modals.findIndex((t) => t.name === name)
         : modals.length - 1;

      const modal = modals[foundIndex];
      const params = modal.params;

      if (foundIndex > -1) {
         params?.onClose?.();

         const active = modals?.[foundIndex - 1];

         modals.splice(foundIndex, 1);

         set({
            modals,
            active,
         });
      }
   },
}));
