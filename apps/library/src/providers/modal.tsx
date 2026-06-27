import { Modal } from '@components/modal';
import { modalStore } from '@stores/modal';
import { getFocusableElements } from '@utils/focus';
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
   const active = modalStore((state) => state.active);
   const closeModal = modalStore((state) => state.closeModal);
   const rootRef = useRef<HTMLElement>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const returnFocusRef = useRef<HTMLElement | null>(null);

   useEffect(() => {
      rootRef.current = document.body;
   }, []);

   const hasOpenModals = activeModals.length > 0;

   // Close the topmost modal on Escape. Enabled by default; an explicit
   // `false` (per-modal or via initialParams) is required to disable it.
   useEffect(() => {
      if (!hasOpenModals) {
         return;
      }

      const lastModalParams = activeModals[activeModals.length - 1]?.params as
         | BaseModalParams
         | undefined;

      const closeOnPressEsc =
         lastModalParams?.closeOnPressEsc ??
         initialParams?.closeOnPressEsc ??
         true;

      if (!closeOnPressEsc) {
         return;
      }

      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape') {
            closeModal();
         }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
   }, [
      activeModals,
      closeModal,
      initialParams?.closeOnPressEsc,
      hasOpenModals,
   ]);

   // Lock background scroll while any modal is open.
   useEffect(() => {
      if (!hasOpenModals) {
         return;
      }

      const { body } = document;
      const previousOverflow = body.style.overflow;
      body.style.overflow = 'hidden';

      return () => {
         body.style.overflow = previousOverflow;
      };
   }, [hasOpenModals]);

   // Focus management: move focus into the active dialog when a modal opens,
   // and restore focus to the previously focused element when the stack
   // empties. The active dialog is resolved by id (from store state) so
   // exiting modals don't steal focus during their exit.
   useEffect(() => {
      const activeId = active?.id;

      if (!hasOpenModals) {
         returnFocusRef.current?.focus?.();
         returnFocusRef.current = null;
         return;
      }

      if (returnFocusRef.current === null) {
         returnFocusRef.current =
            (document.activeElement as HTMLElement | null) ?? null;
      }

      const dialog = activeId
         ? containerRef.current?.querySelector<HTMLElement>(
              `[data-modal-id="${activeId}"]`,
           )
         : undefined;

      if (dialog) {
         const focusables = getFocusableElements(dialog);
         (focusables[0] ?? dialog).focus();
      }
   }, [active, hasOpenModals]);

   return (
      rootRef.current &&
      createPortal(
         <div className='react-motion-modal' ref={containerRef}>
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
