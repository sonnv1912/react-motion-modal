import type { TargetAndTransition } from 'motion';
import type { ReactElement } from 'react';
import type { ModalDefinition } from '../hooks/store/use-modal';

export type ModalName = keyof ModalDefinition;

export type BaseModalParams = {
   /**
    * Function to close the modal
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

export type Params<T extends ModalName> = ModalDefinition[T] & BaseModalParams;

export type ModalParams<T extends ModalName> = Omit<
   Params<T>,
   'animate' | 'body' | 'container' | 'onClose'
>;

export type ModalComponent<T = any> = (props: T) => ReactElement;

export type ModalConfig = {
   [K in ModalName]: ModalComponent<Params<K>>;
};

export type ActiveModal = {
   id: string;
   name: ModalName;
   params?: Params<ModalName>;
};

export type ModalState = {
   modals: ActiveModal[];
   active?: ActiveModal;
};

export type ModalAction = {
   closeModal: (name?: ModalName) => void;
   closeAllModal: () => void;
   openModal: <T extends ModalName>(
      name: T,
      params?: Omit<Params<T>, 'closeModal'>,
   ) => void;
};
