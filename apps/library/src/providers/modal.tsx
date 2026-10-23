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
   const coordinatorTokenRef = useRef<object>({});
   const focusMemoryRef = useRef(new Map<string, HTMLElement | null>());
   const previousIdsRef = useRef<string[]>([]);
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
      if (!doc || !portalRoot) {
         return;
      }

      const token = coordinatorTokenRef.current;
      const ids = activeModals.map((modal) => modal.id);
      const previousIds = previousIdsRef.current;
      const openedIds = ids.filter((id) => !previousIds.includes(id));
      const closedIds = previousIds.filter((id) => !ids.includes(id));

      // Remember where focus lived before each layer moved it, so closing a
      // layer restores the exact element instead of the first focusable one.
      for (const modal of activeModals) {
         if (!focusMemoryRef.current.has(modal.id)) {
            focusMemoryRef.current.set(
               modal.id,
               (doc.activeElement as HTMLElement | null) ?? null,
            );
         }
      }

      previousIdsRef.current = ids;

      if (openedIds.length > 0) {
         // The latest modal owns Escape/Tab while its layer stays on top,
         // even when another provider already had modals open.
         claimKeyboardOwnership(doc, token);

         const topId = ids[ids.length - 1];

         if (topId) {
            const dialog = containerRef.current?.querySelector<HTMLElement>(
               `[data-modal-id="${topId}"]`,
            );

            (getFocusableElements(dialog)[0] ?? dialog)?.focus();
         }

         return;
      }

      if (closedIds.length > 0) {
         const topClosedId = closedIds[closedIds.length - 1];
         const target = topClosedId
            ? (focusMemoryRef.current.get(topClosedId) ?? null)
            : null;

         for (const id of closedIds) {
            focusMemoryRef.current.delete(id);
         }

         if (target?.isConnected) {
            target.focus();

            if (doc.activeElement === target) {
               return;
            }
         }

         const nextTop = activeModals[activeModals.length - 1];

         if (nextTop) {
            const dialog = containerRef.current?.querySelector<HTMLElement>(
               `[data-modal-id="${nextTop.id}"]`,
            );

            (getFocusableElements(dialog)[0] ?? dialog)?.focus();
         }
      }
   }, [activeModals, doc, portalRoot]);

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
