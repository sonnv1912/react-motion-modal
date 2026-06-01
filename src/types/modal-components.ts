import type { ReactElement } from 'react';
import type { ModalDefinition } from '../stores/modal';
import type { BaseModalParams } from './base-modal-params';

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
export type ModalParams<T extends ModalName> = ModalDefinition[T] &
   Pick<BaseModalParams, 'closeModal'>;

/**
 * Represents a modal component that accepts props and returns a React element.
 * This is the type definition for modal components that can be registered in the modal system.
 *
 * @template T - The type of props the component accepts, defaults to any
 *
 * @example
 * ```typescript
 * // Basic modal component
 * const AlertModal: ModalComponent<{ message: string; closeModal: () => void }> =
 *   ({ message, closeModal }) => (
 *     <div className="bg-white p-6 rounded-lg shadow-lg">
 *       <p>{message}</p>
 *       <button onClick={closeModal}>Close</button>
 *     </div>
 *   );
 *
 * // Modal component with advanced features
 * const ConfirmModal: ModalComponent<{
 *   message: string;
 *   onConfirm: () => void;
 *   closeModal: () => void;
 *   closeOnClickOutside?: boolean;
 * }> = ({ message, onConfirm, closeModal, closeOnClickOutside = true }) => (
 *   <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
 *     <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
 *     <p className="mb-6">{message}</p>
 *     <div className="flex justify-end gap-3">
 *       <button
 *         onClick={closeModal}
 *         className="px-4 py-2 text-gray-600 hover:text-gray-800"
 *       >
 *         Cancel
 *       </button>
 *       <button
 *         onClick={() => {
 *           onConfirm();
 *           closeModal();
 *         }}
 *         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
 *       >
 *         Confirm
 *       </button>
 *     </div>
 *   </div>
 * );
 * ```
 */
export type ModalComponent<T = any> = (props: T) => ReactElement;

/**
 * Configuration object that maps modal names to their corresponding components.
 * This is used to register all available modals in the system.
 *
 * @example
 * ```typescript
 * // First, define your modal parameters
 * type ModalDefinition = {
 *   alert: { message: string; type?: 'info' | 'warning' | 'error' };
 *   confirm: { message: string; onConfirm: () => void; onCancel?: () => void };
 *   form: { title: string; fields: FormField[]; onSubmit: (data: any) => void };
 * };
 *
 * // Then create your modal components
 * const AlertModal: ModalComponent<Params<'alert'>> = ({ message, type, closeModal }) => (
 *   <div className={`alert alert-${type}`}>
 *     {message}
 *     <button onClick={closeModal}>Dismiss</button>
 *   </div>
 * );
 *
 * const ConfirmModal: ModalComponent<Params<'confirm'>> = ({
 *   message, onConfirm, onCancel, closeModal
 * }) => (
 *   <div className="confirm-dialog">
 *     <p>{message}</p>
 *     <div className="actions">
 *       <button onClick={() => { onCancel?.(); closeModal(); }}>No</button>
 *       <button onClick={() => { onConfirm(); closeModal(); }}>Yes</button>
 *     </div>
 *   </div>
 * );
 *
 * // Finally, create the configuration
 * const modalConfig: ModalConfig = {
 *   alert: AlertModal,
 *   confirm: ConfirmModal,
 *   form: FormModal,
 * };
 *
 * // Use with ModalProvider
 * <ModalProvider config={modalConfig}>
 *   <App />
 * </ModalProvider>
 * ```
 */
export type ModalConfig = {
   [K in ModalName]: ModalComponent<Params<K>>;
};
