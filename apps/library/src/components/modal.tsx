import { MODAL_POSITIONS, MODAL_Z_INDEX } from '@configs/constant';
import { joinClassName } from '@utils/class-name';
import { getModalBodyPositionClassName } from '@utils/modal';
import { mergeModalOptions } from '@utils/modal-options';
import { motion, useIsPresent, useReducedMotion } from 'motion/react';
import type { ActiveModalInstance } from '../system/modal-system';
import type { ModalOpenOptions } from '../types/modal-system';

type Props = {
   data: ActiveModalInstance;
   index: number;
   isActive: boolean;
   defaultOptions?: ModalOpenOptions;
};

const reducedMotion = {
   initial: { opacity: 1 },
   animate: { opacity: 1, transition: { duration: 0 } },
   exit: { opacity: 1, transition: { duration: 0 } },
};

export const Modal = ({ data, index, isActive, defaultOptions }: Props) => {
   const shouldReduceMotion = useReducedMotion();
   const isPresent = useIsPresent();
   const isInteractive = isActive && isPresent;
   const {
      component: Body,
      defaultOptions: definitionOptions,
      preset,
   } = data.definition;
   const options = mergeModalOptions(
      defaultOptions,
      preset
         ? {
              position: preset.position,
              motion: preset.motion,
           }
         : undefined,
      definitionOptions,
      data.options,
   );
   const position = options.position ?? MODAL_POSITIONS.CENTER;
   const closeOnClickOutside = options.closeOnClickOutside ?? true;
   const contentMotion = shouldReduceMotion
      ? reducedMotion
      : options.motion?.content;
   const backdropMotion = shouldReduceMotion
      ? reducedMotion
      : options.motion?.backdrop;

   return (
      <motion.div
         className='react-motion-modal__root'
         initial={false}
         exit={{}}
         // Non-interactive layers (covered or exiting) must not receive focus,
         // clicks, or Tab while their exit animation finishes.
         inert={!isInteractive}
         style={{
            zIndex: MODAL_Z_INDEX + index,
            pointerEvents: isInteractive ? undefined : 'none',
            backdropFilter: options.blur ? 'blur(8px)' : undefined,
            WebkitBackdropFilter: options.blur ? 'blur(8px)' : undefined,
         }}
      >
         <motion.div
            className={joinClassName(
               'react-motion-modal__backdrop',
               isInteractive && 'react-motion-modal__active',
               options.backdrop?.className,
            )}
            initial={backdropMotion?.initial ?? { opacity: 0 }}
            animate={backdropMotion?.animate ?? { opacity: 1 }}
            exit={backdropMotion?.exit ?? { opacity: 0 }}
            style={{
               zIndex: MODAL_Z_INDEX + index,
               ...options.backdrop?.style,
            }}
            onClick={() => {
               if (closeOnClickOutside) {
                  data.cancel('backdrop');
               }
            }}
         />

         <div
            role='dialog'
            aria-modal={isInteractive ? 'true' : undefined}
            aria-hidden={isInteractive ? undefined : true}
            aria-label={
               options.ariaLabelledBy
                  ? undefined
                  : (options.ariaLabel ?? 'Modal')
            }
            aria-labelledby={options.ariaLabelledBy}
            aria-describedby={options.ariaDescribedBy}
            tabIndex={-1}
            data-modal-id={data.id}
            className={joinClassName(
               'react-motion-modal__body',
               getModalBodyPositionClassName(position),
               isInteractive && 'react-motion-modal__body--active',
               options.body?.className,
            )}
            style={{
               ...options.body?.style,
               zIndex: MODAL_Z_INDEX + index + 1,
            }}
            onClick={(event) => event.stopPropagation()}
         >
            <motion.div
               className='react-motion-modal__content'
               initial={contentMotion?.initial}
               animate={contentMotion?.animate}
               exit={contentMotion?.exit}
            >
               <Body
                  input={data.input}
                  resolve={data.resolve}
                  cancel={(reason) => data.cancel(reason)}
               />
            </motion.div>
         </div>
      </motion.div>
   );
};
