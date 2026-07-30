import { Modal } from '@components/modal';
import { getFocusableElements, trapFocus } from '@utils/focus';
import { mergeModalOptions } from '@utils/modal-options';
import { AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from 'zustand/react';
import {
   attachModalProvider,
   getModalSystemStore,
} from '../system/modal-system';
import type {
   ModalOpenOptions,
   ModalRegistry,
   ModalSystem,
} from '../types/modal-system';

export type ModalProviderProps<Registry extends ModalRegistry = ModalRegistry> =
   {
      system: ModalSystem<Registry>;
      defaultOptions?: ModalOpenOptions;
      portalRoot?: HTMLElement | null;
   };

/**
 * Renders one modal system into a portal and owns its browser accessibility
 * lifecycle.
 */
export const ModalProvider = <Registry extends ModalRegistry>({
   system,
   defaultOptions,
   portalRoot: requestedPortalRoot,
}: ModalProviderProps<Registry>) => {
   const store = getModalSystemStore(system);
   const activeModals = useStore(store, (state) => state.activeModals);
   const active = activeModals[activeModals.length - 1];
   const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(
      requestedPortalRoot ?? null,
   );
   const containerRef = useRef<HTMLDivElement>(null);
   const returnFocusRef = useRef<HTMLElement | null>(null);
   const hasOpenModals = activeModals.length > 0;

   useEffect(() => {
      setPortalRoot(requestedPortalRoot ?? document.body);
   }, [requestedPortalRoot]);

   useEffect(() => attachModalProvider(system), [system]);

   useEffect(() => {
      if (!hasOpenModals) {
         return;
      }

      const options = mergeModalOptions(
         defaultOptions,
         active?.definition.preset
            ? {
                 position: active.definition.preset.position,
                 motion: active.definition.preset.motion,
              }
            : undefined,
         active?.definition.defaultOptions,
         active?.options,
      );
      const closeOnPressEsc = options.closeOnPressEsc ?? true;

      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape' && closeOnPressEsc) {
            active?.cancel('escape');
            return;
         }

         const dialog = active
            ? containerRef.current?.querySelector<HTMLElement>(
                 `[data-modal-id="${active.id}"]`,
              )
            : undefined;

         trapFocus(dialog, event);
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
   }, [active, defaultOptions, hasOpenModals]);

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

   useEffect(() => {
      if (!portalRoot) {
         return;
      }

      if (!hasOpenModals) {
         returnFocusRef.current?.focus?.();
         returnFocusRef.current = null;
         return;
      }

      if (returnFocusRef.current === null) {
         returnFocusRef.current =
            (document.activeElement as HTMLElement | null) ?? null;
      }

      const dialog = active
         ? containerRef.current?.querySelector<HTMLElement>(
              `[data-modal-id="${active.id}"]`,
           )
         : undefined;

      if (dialog) {
         const focusables = getFocusableElements(dialog);
         (focusables[0] ?? dialog).focus();
      }
   }, [active, hasOpenModals, portalRoot]);

   if (!portalRoot) {
      return null;
   }

   return createPortal(
      <div className='react-motion-modal' ref={containerRef}>
         <AnimatePresence initial={true} mode='sync'>
            {activeModals.map((item, index) => (
               <Modal
                  key={item.id}
                  data={item}
                  index={index}
                  isActive={active?.id === item.id}
                  defaultOptions={defaultOptions}
               />
            ))}
         </AnimatePresence>
      </div>,
      portalRoot,
   );
};
