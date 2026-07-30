import { Modal } from '@components/modal';
import { modalStore } from '@stores/modal';
import { getFocusableElements, trapFocus } from '@utils/focus';
import { AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
   BaseModalParams,
   ModalConfig,
   ModalInitialParams,
} from '#types/modal';

export type ModalProviderProps = {
   modals: ModalConfig;
   initialParams?: ModalInitialParams;
};

export const ModalProvider = ({
   modals,
   initialParams,
}: ModalProviderProps) => {
   const activeModals = modalStore((state) => state.modals);
   const active = modalStore((state) => state.active);
   const closeModal = modalStore((state) => state.closeModal);
   const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const returnFocusRef = useRef<HTMLElement | null>(null);

   useEffect(() => {
      setPortalRoot(document.body);
   }, []);

   const hasOpenModals = activeModals.length > 0;

   // Close the topmost modal on Escape. Enabled by default; an explicit
   // `false` (per-modal or via initialParams) is required to disable it.
   useEffect(() => {
      const lastModalParams = activeModals[activeModals.length - 1]?.params as
         | BaseModalParams
         | undefined;

      const closeOnPressEsc =
         lastModalParams?.closeOnPressEsc ??
         initialParams?.closeOnPressEsc ??
         true;

      if (!hasOpenModals) {
         return;
      }

      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape' && closeOnPressEsc) {
            closeModal();
            return;
         }

         const activeId = active?.id;
         const dialog = activeId
            ? containerRef.current?.querySelector<HTMLElement>(
                 `[data-modal-id="${activeId}"]`,
              )
            : undefined;

         trapFocus(dialog, event);
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
   }, [
      activeModals,
      active?.id,
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
      portalRoot &&
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
         portalRoot,
      )
   );
};
