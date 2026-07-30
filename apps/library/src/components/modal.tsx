import { MODAL_POSITIONS, MODAL_Z_INDEX } from '@configs/constant';
import { modalStore } from '@stores/modal';
import { joinClassName } from '@utils/class-name';
import {
   getModalBodyAnimation,
   getModalBodyPositionClassName,
} from '@utils/modal';
import { motion } from 'motion/react';
import type {
   ActiveModal,
   BaseModalParams,
   ModalComponent,
   ModalConfig,
   ModalInitialParams,
} from '#types/modal';

type Props = {
   data: ActiveModal;
   modals: ModalConfig;
   index: number;
   initialParams?: ModalInitialParams;
};

export const Modal = ({ data, modals, index, initialParams }: Props) => {
   const Body = modals[data.name] as ModalComponent<any>;
   const modalParams = data.params as BaseModalParams | undefined;
   const params = {
      ...initialParams,
      ...modalParams,
   } as BaseModalParams;
   const animate = params?.animate ?? initialParams?.animate;
   const blur = params?.blur ?? initialParams?.blur ?? true;
   const backdrop = params?.backdrop ?? initialParams?.backdrop;
   const body = params?.body ?? initialParams?.body;

   const position =
      params?.position ?? initialParams?.position ?? MODAL_POSITIONS.CENTER;

   const closeOnClickOutside =
      params?.closeOnClickOutside ?? initialParams?.closeOnClickOutside ?? true;

   const bodyAnimation = animate ? undefined : getModalBodyAnimation(position);
   const active = modalStore((state) => state.active);
   const isActive = active?.id === data.id;

   // `onClose` is invoked by the store's `closeModal` action (the single
   // source of truth), so it must NOT be called again here — otherwise it
   // fires twice when the user clicks outside the modal.
   return (
      <motion.div
         className='react-motion-modal__root'
         exit={animate?.exit ?? { opacity: 0 }}
         initial={animate?.exit ?? { opacity: 0 }}
         animate={animate?.animate ?? { opacity: 1 }}
         layout={true}
         style={{
            zIndex: MODAL_Z_INDEX + index,
            pointerEvents: isActive ? undefined : 'none',
            backdropFilter: blur ? 'blur(8px)' : undefined,
            WebkitBackdropFilter: blur ? 'blur(8px)' : undefined,
         }}
      >
         <div
            className={joinClassName(
               'react-motion-modal__backdrop',
               isActive && 'react-motion-modal__active',
               backdrop?.className && 'react-motion-modal__backdrop--custom',
               backdrop?.className,
            )}
            style={{
               zIndex: MODAL_Z_INDEX + index,
               ...backdrop?.style,
            }}
            onClick={() => {
               if (closeOnClickOutside) {
                  params.closeModal();
               }
            }}
         />

         <div
            role='dialog'
            aria-modal={isActive ? 'true' : undefined}
            aria-hidden={isActive ? undefined : true}
            aria-label={
               params.ariaLabelledBy ? undefined : (params.ariaLabel ?? 'Modal')
            }
            aria-labelledby={params.ariaLabelledBy}
            aria-describedby={params.ariaDescribedBy}
            tabIndex={-1}
            data-modal-id={data.id}
            className={joinClassName(
               'react-motion-modal__body',
               getModalBodyPositionClassName(position),
               isActive && 'react-motion-modal__body--active',
               body?.className,
            )}
            style={{
               ...body?.style,
               zIndex: MODAL_Z_INDEX + index + 1,
            }}
            onClick={(e) => e.stopPropagation()}
         >
            <motion.div
               className='react-motion-modal__content'
               initial={bodyAnimation?.initial}
               animate={bodyAnimation?.animate}
               exit={bodyAnimation?.exit}
            >
               <Body {...(params as any)} />
            </motion.div>
         </div>
      </motion.div>
   );
};
