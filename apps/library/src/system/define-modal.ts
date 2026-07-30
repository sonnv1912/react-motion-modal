import type { ModalDefinition } from '../types/modal-system';

/**
 * Defines one modal contract while preserving its input and result types.
 */
export const defineModal = <Input, Result>(
   definition: ModalDefinition<Input, Result>,
): ModalDefinition<Input, Result> => definition;
