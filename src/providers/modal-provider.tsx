import { useModal } from '@hooks/store/use-modal';
import clsx from 'clsx';
import keyboard from 'keyboardjs';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import type { BaseModalParams, ModalConfig } from '#types/modal.type';

type Props = {
   modals: ModalConfig;
   initialParams?: Partial<BaseModalParams>;
};

export const ModalProvider = ({ modals, initialParams }: Props) => {
   const activeModals = useModal((state) => state.modals);
   const closeModal = useModal((state) => state.closeModal);
   const active = useModal((state) => state.active);
   const rootRef = useRef<HTMLElement>(null);

   useEffect(() => {
      if (activeModals.length) {
         rootRef.current?.classList.add('react-motion-modal__opening');
      } else {
         rootRef.current?.classList.remove('react-motion-modal__opening');
      }
   }, [activeModals.length]);

   useEffect(() => {
      rootRef.current = document.body;

      if (
         activeModals?.length === 0 ||
         (!activeModals[activeModals.length - 1].params?.closeOnPressEsc &&
            !initialParams?.closeOnPressEsc)
      ) {
         return;
      }

      const event = () => {
         closeModal();
      };

      keyboard.bind(['escape'], event);

      return () => keyboard.unbind(['escape'], event);
   }, [activeModals, closeModal, initialParams?.closeOnPressEsc]);

   return (
      rootRef.current &&
      createPortal(
         <div id='react-motion-modal'>
            <AnimatePresence initial={true} mode='sync'>
               {activeModals?.map((item, index) => {
                  const Body = modals[item.name];
                  const params = item.params || initialParams;
                  const animate = params?.animate || initialParams?.animate;
                  const onClose = params?.onClose || initialParams?.onClose;
                  const container =
                     params?.container || initialParams?.container;
                  const body = params?.body || initialParams?.body;

                  const closeOnClickOutside =
                     params?.closeOnClickOutside ||
                     initialParams?.closeOnClickOutside;

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
                        className={twMerge(
                           'fixed top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm',
                           container?.className,
                        )}
                        onClick={() => {
                           if (closeOnClickOutside) {
                              closeModal();

                              onClose?.();
                           }
                        }}
                     >
                        <div
                           className={twMerge(
                              clsx(
                                 'p-5 absolute max-h-screen max-w-screen overflow-auto top-1/2 -translate-y-1/2',
                                 'lg:left-1/2 lg:-translate-x-1/2',
                                 {
                                    'react-motion-modal__active':
                                       active?.id === item.id,
                                 },
                              ),
                              body?.className,
                           )}
                           onClick={(e) => e.stopPropagation()}
                        >
                           <Body {...(params as any)} />
                        </div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </div>,
         rootRef.current,
      )
   );
};
