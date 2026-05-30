import type { ModalName, Params } from './modal-components.type';

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
