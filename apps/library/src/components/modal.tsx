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
} from '#types/modal';

type Props = {
   data: ActiveModal;
   modals: ModalConfig;
   index: number;
   initialParams?: Partial<BaseModalParams>;
};

export const Modal = ({ data, modals, index, initialParams }: Props) => {
   const Body = modals[data.name] as ModalComponent<any>;
   const params = data.params ?? initialParams;
   const animate = params?.animate ?? initialParams?.animate;
   const blur = params?.blur ?? initialParams?.blur ?? true;
   const onClose = params?.onClose ?? initialParams?.onClose;
   const backdrop = params?.backdrop ?? initialParams?.backdrop;
   const body = params?.body ?? initialParams?.body;

   const position =
      params?.position ?? initialParams?.position ?? MODAL_POSITIONS.CENTER;

   const closeOnClickOutside =
      params?.closeOnClickOutside ?? initialParams?.closeOnClickOutside ?? true;

   const bodyAnimation = animate ? undefined : getModalBodyAnimation(position);
   const active = modalStore((state) => state.active);
   const closeModal = modalStore((state) => state.closeModal);

   return (
      <motion.div
         className='react-motion-modal__root'
         exit={animate?.exit ?? { opacity: 0 }}
         initial={animate?.exit ?? { opacity: 0 }}
         animate={animate?.animate ?? { opacity: 1 }}
         layout={true}
         style={{
            zIndex: MODAL_Z_INDEX + index,
            backdropFilter: blur ? 'blur(8px)' : undefined,
            WebkitBackdropFilter: blur ? 'blur(8px)' : undefined,
         }}
      >
         <div
            className={joinClassName(
               'react-motion-modal__backdrop',
               active?.id === data.id && 'react-motion-modal__active',
               backdrop?.className && 'react-motion-modal__backdrop--custom',
               backdrop?.className,
            )}
            style={{
               zIndex: MODAL_Z_INDEX + index,
               ...backdrop?.style,
            }}
            onClick={() => {
               if (closeOnClickOutside) {
                  closeModal();

                  onClose?.();
               }
            }}
         />

         <div
            className={joinClassName(
               'react-motion-modal__body',
               getModalBodyPositionClassName(position),
               active?.id === data.id && 'react-motion-modal__body--active',
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
