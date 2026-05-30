import type { TargetAndTransition } from 'motion';

/**
 * Base parameters available for all modals.
 * These parameters control modal behavior, styling, and animation.
 */
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
    * Styling options for the outer backdrop (overlay) of the modal.
    * This backdrop typically provides the backdrop and centers the modal content.
    */
   backdrop?: {
      /**
       * CSS class name to apply to the modal backdrop.
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
    *
    * @example
    * ```typescript
    * // Simple fade animation
    * animate: {
    *   animate: { opacity: 1 },
    *   exit: { opacity: 0 }
    * }
    *
    * // Scale and fade animation
    * animate: {
    *   animate: {
    *     opacity: 1,
    *     scale: 1,
    *     transition: { duration: 0.3, ease: "easeOut" }
    *   },
    *   exit: {
    *     opacity: 0,
    *     scale: 0.9,
    *     transition: { duration: 0.2, ease: "easeIn" }
    *   }
    * }
    *
    * // Slide up animation
    * animate: {
    *   animate: {
    *     opacity: 1,
    *     y: 0,
    *     transition: { type: "spring", stiffness: 300, damping: 30 }
    *   },
    *   exit: {
    *     opacity: 0,
    *     y: 50,
    *     transition: { duration: 0.25 }
    *   }
    * }
    * ```
    */
   animate?: {
      /**
       * Animation properties for the exit transition (when modal is closing).
       * Accepts any valid Framer Motion TargetAndTransition properties.
       *
       * @example
       * ```typescript
       * // Simple fade out
       * exit: { opacity: 0 }
       *
       * // Scale down and fade out
       * exit: {
       *   opacity: 0,
       *   scale: 0.8,
       *   transition: { duration: 0.2 }
       * }
       * ```
       */
      exit?: TargetAndTransition;

      /**
       * Animation properties for the animate state (when modal is visible).
       * Accepts any valid Framer Motion TargetAndTransition properties.
       *
       * @example
       * ```typescript
       * // Simple fade in
       * animate: { opacity: 1 }
       *
       * // Scale up and fade in with spring
       * animate: {
       *   opacity: 1,
       *   scale: 1,
       *   transition: { type: "spring", stiffness: 400 }
       * }
       * ```
       */
      animate?: TargetAndTransition;
   };

   /**
    * Optional positioning string for modal placement.
    * This can be used to override default modal positioning behavior.
    *
    * @example
    * ```typescript
    * import { MODAL_POSITIONS } from 'react-motion-modal';
    *
    * // Available positions
    * MODAL_POSITIONS.TOP_LEFT     // 'top-left'
    * MODAL_POSITIONS.TOP_CENTER   // 'top-center'
    * MODAL_POSITIONS.TOP_RIGHT    // 'top-right'
    * MODAL_POSITIONS.CENTER_LEFT  // 'center-left'
    * MODAL_POSITIONS.CENTER       // 'center' (default)
    * MODAL_POSITIONS.CENTER_RIGHT // 'center-right'
    * MODAL_POSITIONS.BOTTOM_LEFT  // 'bottom-left'
    * MODAL_POSITIONS.BOTTOM_CENTER// 'bottom-center'
    * MODAL_POSITIONS.BOTTOM_RIGHT // 'bottom-right'
    * ```
    */
   position?: string;

   /**
    * Enables backdrop blur effect when modal is open.
    * When set to true, the background content will be blurred.
    * @default false
    */
   blur?: boolean;
};
