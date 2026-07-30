import type { ModalOpenOptions, ModalSlotOptions } from '../types/modal-system';

const mergeSlot = (
   current?: ModalSlotOptions,
   next?: ModalSlotOptions,
): ModalSlotOptions | undefined => {
   if (!current && !next) {
      return undefined;
   }

   return {
      ...current,
      ...next,
      style: {
         ...current?.style,
         ...next?.style,
      },
   };
};

export const mergeModalOptions = (
   ...sources: Array<ModalOpenOptions | undefined>
): ModalOpenOptions => {
   const options: ModalOpenOptions = {};

   for (const source of sources) {
      const backdrop = mergeSlot(options.backdrop, source?.backdrop);
      const body = mergeSlot(options.body, source?.body);

      Object.assign(options, source);
      options.backdrop = backdrop;
      options.body = body;
   }

   return options;
};
