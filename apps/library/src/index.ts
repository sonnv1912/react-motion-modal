import './assets/style/main.css';

import type { ModalDefinition } from './stores/modal';

export type {
   ActiveModal,
   BaseModalParams,
   ModalAction,
   ModalComponent,
   ModalConfig,
   ModalInitialParams,
   ModalName,
   ModalParams,
   ModalState,
   Params,
} from '#types/modal';
export * from './configs/constant';
export * from './providers/modal';
export * from './stores/modal';
export type { ModalDefinition };
