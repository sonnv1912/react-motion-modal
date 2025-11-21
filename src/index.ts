import './assets/style/main.css';

import type { ModalParams } from '#types/modal.type';
import type { ModalDefinition } from './hooks/store/use-modal';

export * from './configs/constant';
export * from './hooks/store/use-modal';
export * from './providers/modal-provider';

export type { ModalParams, ModalDefinition };
