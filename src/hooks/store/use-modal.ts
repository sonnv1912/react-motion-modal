import type { TargetAndTransition } from 'motion/react';
import type { ReactElement } from 'react';
import { v4 } from 'uuid';
import { create } from 'zustand/react';

// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface ModalStackParams {}

export type ModalName = keyof ModalStackParams;

export type BaseModalParams = {
   closeModal: () => void;
   closeWhenClickOutside?: boolean;
   container?: {
      className?: string;
      override?: boolean;
   };
   body?: {
      className?: string;
      override?: boolean;
   };
   animate?: {
      exit?: TargetAndTransition;
      animate?: TargetAndTransition;
   };
};

export type ModalParams<T extends ModalName> = Parameters<
   ModalStackParams[T]
>[0] &
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
         if (foundIndex !== -1) {
            activeModals.splice(foundIndex, 1);
         }
      } else {
         activeModals.pop();
      }

      set({
         activeModals,
      });
   },
}));
