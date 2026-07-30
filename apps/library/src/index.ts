import './assets/style/main.css';

export type { ModalPosition } from './configs/constant';
export {
   MODAL_POSITIONS,
   MODAL_Z_INDEX,
} from './configs/constant';
export { motionPresets } from './presets/motion';
export {
   ModalProvider,
   type ModalProviderProps,
} from './providers/modal';
export { defineModal } from './system/define-modal';
export { createModalSystem } from './system/modal-system';
export type {
   AnyModalDefinition,
   ModalCancelReason,
   ModalDefinition,
   ModalInput,
   ModalMotion,
   ModalMotionPreset,
   ModalMotionState,
   ModalOpenOptions,
   ModalOutcome,
   ModalPolicy,
   ModalRegistry,
   ModalRenderProps,
   ModalResult,
   ModalSlotOptions,
   ModalSystem,
} from './types/modal-system';
