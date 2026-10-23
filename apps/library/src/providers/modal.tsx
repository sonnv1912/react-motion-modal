import { Modal } from '@components/modal';
import {
   acquireScrollLock,
   claimKeyboardOwnership,
   hasKeyboardOwnership,
   releaseKeyboardOwnership,
   releaseScrollLock,
} from '@utils/document-modal-coordinator';
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
 * lifecycle. Providers that share one document coordinate body scroll locking
 * and keyboard ownership through a per-document coordinator, so independent
 * systems never unlock or cancel each other.
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
   const coordinatorTokenRef = useRef<object>({});
   const hasOpenModals = activeModals.length > 0;
   const doc = portalRoot?.ownerDocument ?? null;

   useEffect(() => {
      setPortalRoot(requestedPortalRoot ?? document.body);
   }, [requestedPortalRoot]);

   useEffect(() => attachModalProvider(system), [system]);

   useEffect(() => {
      const onPopState = () => system.cancelAll('programmatic');

      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
   }, [system]);

   useEffect(() => {
      if (!doc || !hasOpenModals) {
         return;
      }

      const token = coordinatorTokenRef.current;
      claimKeyboardOwnership(doc, token);

      return () => releaseKeyboardOwnership(doc, token);
   }, [doc, hasOpenModals]);

   useEffect(() => {
      if (!doc || !hasOpenModals) {
         return;
      }

      const token = coordinatorTokenRef.current;
      const view = doc.defaultView;

      if (!view) {
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
         if (!hasKeyboardOwnership(doc, token)) {
            return;
         }

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

      view.addEventListener('keydown', onKeyDown);
      return () => view.removeEventListener('keydown', onKeyDown);
   }, [active, defaultOptions, doc, hasOpenModals]);

   useEffect(() => {
      if (!doc || !hasOpenModals) {
         return;
      }

      const token = coordinatorTokenRef.current;
      acquireScrollLock(doc, token);

      return () => releaseScrollLock(doc, token);
   }, [doc, hasOpenModals]);

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
            (doc?.activeElement as HTMLElement | null) ?? null;
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
   }, [active, doc, hasOpenModals, portalRoot]);

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
