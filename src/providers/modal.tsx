import { Modal } from '@components/modal';
import { modalStore } from '@stores/modal';
import { AnimatePresence } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { BaseModalParams, ModalConfig } from '#types/modal';

type Props = {
   modals: ModalConfig;
   initialParams?: Partial<BaseModalParams>;
};

export const ModalProvider = ({ modals, initialParams }: Props) => {
   const activeModals = modalStore((state) => state.modals);
   const closeModal = modalStore((state) => state.closeModal);
   const rootRef = useRef<HTMLElement>(null);

   useEffect(() => {
      rootRef.current = document.body;
      const lastModalParams = activeModals[activeModals.length - 1]
         ?.params as BaseModalParams | undefined;

      if (
         activeModals?.length === 0 ||
         (!lastModalParams?.closeOnPressEsc && !initialParams?.closeOnPressEsc)
      ) {
         return;
      }

      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape') {
            closeModal();
         }
      };

      window.addEventListener('keydown', onKeyDown);

      return () => window.removeEventListener('keydown', onKeyDown);
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
