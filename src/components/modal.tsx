import { MODAL_POSITIONS } from '@configs/constant';
import { useModal } from '@hooks/store/use-modal';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import type {
   ActiveModal,
   BaseModalParams,
   ModalConfig,
} from '#types/modal.type';

type Props = {
   data: ActiveModal;
   modals: ModalConfig;
   index: number;
   initialParams?: Partial<BaseModalParams>;
};

export const Modal = ({ data, modals, index, initialParams }: Props) => {
   const Body = modals[data.name];
   const params = data.params || initialParams;
   const animate = params?.animate || initialParams?.animate;
   const onClose = params?.onClose || initialParams?.onClose;
   const backdrop = params?.backdrop || initialParams?.backdrop;
   const body = params?.body || initialParams?.body;

   const position =
      params?.position || initialParams?.position || MODAL_POSITIONS.CENTER;

   const closeOnClickOutside =
      params?.closeOnClickOutside || initialParams?.closeOnClickOutside;

   const active = useModal((state) => state.active);
   const closeModal = useModal((state) => state.closeModal);

   return (
      <motion.div
         exit={animate?.exit ?? { opacity: 0 }}
         initial={animate?.exit ?? { opacity: 0 }}
         animate={animate?.animate ?? { opacity: 1 }}
         layout={true}
      >
         <div
            className={twMerge(
               clsx(
                  'fixed top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm',
                  {
                     'react-motion-modal__active': active?.id === data.id,
                  },
               ),
               backdrop?.className,
            )}
            style={{
               zIndex: index,
            }}
            onClick={() => {
               if (closeOnClickOutside) {
                  closeModal();

                  onClose?.();
               }
            }}
         />

         <div
            className={twMerge(
               clsx(
                  'p-5 absolute max-h-screen max-w-screen overflow-hidden left-0 right-0',
                  {
                     'overflow-auto': active?.id === data.id,
                     'top-1/2 -translate-y-1/2 lg:left-1/2 lg:-translate-x-1/2':
                        position === MODAL_POSITIONS.CENTER,
                     'top-0 lg:left-1/2 lg:-translate-x-1/2':
                        position === MODAL_POSITIONS.TOP,
                     'bottom-0 lg:left-1/2 lg:-translate-x-1/2':
                        position === MODAL_POSITIONS.BOTTOM,
                  },
               ),
               body?.className,
            )}
            style={{
               zIndex: index + 1,
            }}
            onClick={(e) => e.stopPropagation()}
         >
            <Body {...(params as any)} />
         </div>
      </motion.div>
   );
};
