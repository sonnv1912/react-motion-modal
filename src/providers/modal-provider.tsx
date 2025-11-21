import { Modal } from '@components/modal';
import { useModal } from '@hooks/store/use-modal';
import keyboard from 'keyboardjs';
import { AnimatePresence } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { BaseModalParams, ModalConfig } from '#types/modal.type';

type Props = {
   modals: ModalConfig;
   initialParams?: Partial<BaseModalParams>;
};

export const ModalProvider = ({ modals, initialParams }: Props) => {
   const activeModals = useModal((state) => state.modals);
   const closeModal = useModal((state) => state.closeModal);
   const rootRef = useRef<HTMLElement>(null);

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
         <div className='react-motion-modal'>
            <AnimatePresence initial={true} mode='sync'>
               {activeModals?.map((item, index) => (
                  <Modal
                     key={item.id}
                     data={item}
                     index={index}
                     initialParams={initialParams}
                     modals={modals}
                  />
               ))}
            </AnimatePresence>
         </div>,
         rootRef.current,
      )
   );
};
