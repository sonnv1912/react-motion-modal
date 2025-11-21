import type { TargetAndTransition } from 'motion';
import type { ReactElement } from 'react';
import type { ModalDefinition } from '../hooks/store/use-modal';

/**
 * Extracts the key type from the ModalDefinition interface.
 * This represents all available modal names that can be opened in the application.
 *
 * @example
 * ```typescript
 * // If ModalDefinition is { alert: AlertParams, confirm: ConfirmParams }
 * type ModalName = 'alert' | 'confirm';
 * ```
 */
export type ModalName = keyof ModalDefinition;

export type BaseModalParams = {
   /**
    * Function to close the modal programmatically.
    * This is automatically injected by the modal system and should not be provided when opening a modal.
    */
   closeModal: () => void;

   /**
    * Callback triggered when the modal is closed (either by user action or programmatically).
    * Use this for cleanup operations or side effects after modal close.
    */
   onClose?: () => void;

   /**
    * Controls whether the modal should close when the user clicks outside the modal content.
    * @default true
    */
   closeOnClickOutside?: boolean;

   /**
    * Controls whether the modal should close when the user presses the Escape key.
    * @default true
    */
   closeOnPressEsc?: boolean;

   /**
    * Styling options for the outer container (overlay) of the modal.
    * This container typically provides the backdrop and centers the modal content.
    */
   container?: {
      /**
       * CSS class name to apply to the modal container.
       * Useful for custom styling or responsive behavior.
       */
      className?: string;
   };

   /**
    * Styling options for the modal content/body.
    * This is the actual modal content area where your component is rendered.
    */
   body?: {
      /**
       * CSS class name to apply to the modal body.
       * Useful for custom styling, sizing, or positioning of modal content.
       */
      className?: string;
   };

   /**
    * Framer Motion animation settings for modal entrance and exit animations.
    * These settings define how the modal appears and disappears.
    */
   animate?: {
      /**
       * Animation properties for the exit transition (when modal is closing).
       * Accepts any valid Framer Motion TargetAndTransition properties.
       * Example: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
       */
      exit?: TargetAndTransition;

      /**
       * Animation properties for the animate state (when modal is visible).
       * Accepts any valid Framer Motion TargetAndTransition properties.
       * Example: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
       */
      animate?: TargetAndTransition;
   };

   /**
    * Optional positioning string for modal placement.
    * This can be used to override default modal positioning behavior.
    * import { MODAL_POSITIONS } from 'react-motion-modal';
    */
   position?: string;
};

/**
 * Combines the modal-specific parameters from ModalDefinition with the base modal parameters.
 * This represents the complete set of props that a modal component will receive.
 *
 * @template T - The modal name type
 *
 * @example
 * ```typescript
 * // For a modal named 'alert' with AlertParams defined in ModalDefinition
 * type AlertModalParams = Params<'alert'>; // AlertParams & BaseModalParams
 * ```
 */
export type Params<T extends ModalName> = ModalDefinition[T] & BaseModalParams;

/**
 * Extracts only the closeModal function from the modal parameters.
 * This is useful when you need to pass only the close functionality to components.
 *
 * @template T - The modal name type
 */
export type ModalParams<T extends ModalName> = Pick<Params<T>, 'closeModal'>;

/**
 * Represents a modal component that accepts props and returns a React element.
 * This is the type definition for modal components that can be registered in the modal system.
 *
 * @template T - The type of props the component accepts, defaults to any
 *
 * @example
 * ```typescript
 * const AlertModal: ModalComponent<{ message: string; closeModal: () => void }> =
 *   ({ message, closeModal }) => <div>{message}<button onClick={closeModal}>Close</button></div>;
 * ```
 */
export type ModalComponent<T = any> = (props: T) => ReactElement;

/**
 * Configuration object that maps modal names to their corresponding components.
 * This is used to register all available modals in the system.
 *
 * @example
 * ```typescript
 * const modalConfig: ModalConfig = {
 *   alert: AlertModal,
 *   confirm: ConfirmModal,
 *   // ... other modals
 * };
 * ```
 */
export type ModalConfig = {
   [K in ModalName]: ModalComponent<Params<K>>;
};

/**
 * Represents a currently active (opened) modal instance.
 * Each modal gets a unique ID and maintains its state in the modal stack.
 *
 * @example
 * ```typescript
 * const modal: ActiveModal = {
 *   id: 'uuid-123',
 *   name: 'alert',
 *   params: { message: 'Hello', closeModal: () => {}, onClose: () => {} }
 * };
 * ```
 */
export type ActiveModal = {
   /**
    * Unique identifier for this modal instance.
    * Generated automatically when the modal is opened.
    */
   id: string;

   /**
    * The name/type of the modal (key from ModalDefinition).
    */
   name: ModalName;

   /**
    * Parameters passed to the modal, including both custom params and base modal params.
    */
   params?: Params<ModalName>;
};

/**
 * Represents the current state of all modals in the application.
 * This includes the modal stack and the currently active modal.
 */
export type ModalState = {
   /**
    * Array of all currently open modals, ordered by their opening sequence.
    * The last modal in the array is the topmost modal.
    */
   modals: ActiveModal[];

   /**
    * The currently active (topmost) modal, or undefined if no modals are open.
    */
   active?: ActiveModal;
};

/**
 * Actions that can be performed on the modal system.
 * These are the functions available to control modal behavior.
 */
export type ModalAction = {
   /**
    * Closes a specific modal by name or the topmost modal if no name is provided.
    *
    * @param name - Optional modal name to close. If not provided, closes the topmost modal.
    *
    * @example
    * ```typescript
    * closeModal('alert'); // Closes the alert modal
    * closeModal(); // Closes the current (topmost) modal
    * ```
    */
   closeModal: (name?: ModalName) => void;

   /**
    * Closes all open modals immediately.
    * This is useful for clearing the modal stack, such as during route navigation.
    *
    * @example
    * ```typescript
    * closeAllModal(); // Closes all modals
    * ```
    */
   closeAllModal: () => void;

   /**
    * Opens a new modal with optional parameters.
    *
    * @template T - The modal name type
    * @param name - The name of the modal to open
    * @param params - Optional parameters to pass to the modal (excluding closeModal which is auto-injected)
    *
    * @example
    * ```typescript
    * openModal('alert', {
    *   message: 'Hello World',
    *   onClose: () => console.log('Alert closed'),
    *   closeOnClickOutside: false
    * });
    * ```
    */
   openModal: <T extends ModalName>(
      name: T,
      params?: Omit<Params<T>, 'closeModal'>,
   ) => void;
};
