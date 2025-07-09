import clsx from 'clsx';
import keyboard from 'keyboardjs';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { type ModalConfig, useModal } from '../hooks/store/use-modal';

import '../assets/style/main.css';

type Props = {
   modals: ModalConfig;
};

export const ModalProvider = ({ modals }: Props) => {
   const activeModals = useModal((state) => state.activeModals);
   const closeModal = useModal((state) => state.closeModal);
   const rootRef = useRef<HTMLElement>(null);

   useEffect(() => {
      rootRef.current = document.body;

      if (
         activeModals?.length === 0 ||
         !activeModals[activeModals.length - 1].params?.closeOnPressEsc
      ) {
         return;
      }

      const event = () => {
         closeModal();
      };

      keyboard.bind(['escape'], event);

      return () => keyboard.unbind(['escape'], event);
   }, [activeModals, closeModal]);

   return (
      rootRef.current &&
      createPortal(
         <AnimatePresence initial={true} mode='popLayout'>
            {activeModals?.map((item, index) => {
               const Body = modals[item.name];
               const params = item.params;
               const animate = params?.animate;

               return (
                  <motion.div
                     key={item.id}
                     exit={animate?.exit ?? { opacity: 0 }}
                     initial={animate?.exit ?? { opacity: 0 }}
                     animate={animate?.animate ?? { opacity: 1 }}
                     layout={true}
                     style={{
                        zIndex: 100 + index,
                     }}
                     className={clsx(
                        {
                           'fixed top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm':
                              !params?.container?.override,
                        },
                        params?.container?.className,
                     )}
                     onClick={() => {
                        if (params?.closeOnClickOutside) {
                           closeModal();

                           params.onClose?.();
                        }
                     }}
                  >
                     <div
                        className={clsx(
                           {
                              'p-5 absolute max-h-screen max-w-screen overflow-auto top-1/2 -translate-y-1/2':
                                 !params?.body?.override,
                              'lg:left-1/2 lg:-translate-x-1/2':
                                 !params?.body?.override,
                           },
                           params?.body?.className,
                        )}
                        onClick={(e) => e.stopPropagation()}
                     >
                        <Body {...(params as any)} />
                     </div>
                  </motion.div>
               );
            })}
         </AnimatePresence>,
         rootRef.current,
      )
   );
};
