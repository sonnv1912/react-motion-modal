import type { TargetAndTransition } from 'motion/react';
import type { ReactElement } from 'react';
import { v4 } from 'uuid';
import { create } from 'zustand/react';

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface ModalStackParams {}

export type ModalName = keyof ModalStackParams;

export type BaseModalParams = {
   /**
    * Function to close the modal. Automatically injected.
    */
   closeModal: () => void;

   /**
    * Callback triggered when the modal is closed.
    */
   onClose?: () => void;

   /**
    * Whether to close the modal when clicking outside of it.
    */
   closeOnClickOutside?: boolean;

   /**
    * Whether to close the modal when pressing the Escape key.
    */
   closeOnPressEsc?: boolean;

   /**
    * Styling options for the outer container of the modal.
    */
   container?: {
      className?: string;
      override?: boolean;
   };

   /**
    * Styling options for the modal content/body.
    */
   body?: {
      className?: string;
      override?: boolean;
   };

   /**
    * Framer Motion animation settings for entrance and exit.
    */
   animate?: {
      exit?: TargetAndTransition;
      animate?: TargetAndTransition;
   };
};

export type ModalParams<T extends ModalName> = ModalStackParams[T] &
   BaseModalParams;

type ModalComponent<T = any> = (props: T) => ReactElement;

export type ModalConfig = {
   [K in ModalName]: ModalComponent<ModalParams<K>>;
};

type ActiveModal = {
   id: string;
   name: ModalName;
   params?: ModalParams<ModalName>;
};

type State = {
   activeModals: ActiveModal[];
};

type Action = {
   closeModal: (name?: ModalName) => void;
   openModal: <T extends ModalName>(
      name: T,
      params?: Omit<ModalParams<T>, 'closeModal'>,
   ) => void;
};

export const useModal = create<State & Action>((set, get) => ({
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

   closeModal(name) {
      const activeModals = [...get().activeModals];

      if (name) {
         const foundIndex = activeModals.findIndex((t) => t.name === name);
         const modal = activeModals[foundIndex];

         if (foundIndex !== -1) {
            modal.params?.onClose?.();

            activeModals.splice(foundIndex, 1);
         }
      } else {
         const modal = activeModals[activeModals.length - 1];

         modal.params?.onClose?.();

         activeModals.pop();
      }

      set({
         activeModals,
      });
   },
}));
