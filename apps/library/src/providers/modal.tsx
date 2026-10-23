import { Modal } from '@components/modal';
import { MODAL_Z_INDEX } from '@configs/constant';
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

// The claiming provider turns its container into a stacking context above
// every other provider's, so its modals always paint on top.
const applyLayer = (container: HTMLElement | null, layer: number): void => {
   if (!container) {
      return;
   }

   container.style.position = 'relative';
   container.style.zIndex = String(MODAL_Z_INDEX + layer);
};

export type ModalProviderProps<Registry extends ModalRegistry = ModalRegistry> =
   {
      system: ModalSystem<Registry>;
      defaultOptions?: ModalOpenOptions;
      portalRoot?: HTMLElement | null;
   };

/**
 * Renders one modal system into a portal and owns its browser accessibility
 * lifecycle. Providers that share one document coordinate body scroll
 * locking, keyboard ownership and visual layering through a per-document
 * coordinator, so independent systems never unlock, cancel or cover each
 * other accidentally.
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
   const lastFocusedRef = useRef<HTMLElement | null>(null);
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
      applyLayer(containerRef.current, claimKeyboardOwnership(doc, token));

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
      const dialogFor = (id: string) =>
         containerRef.current?.querySelector<HTMLElement>(
            `[data-modal-id="${id}"]`,
         );

      const onKeyDown = (event: KeyboardEvent) => {
         if (!hasKeyboardOwnership(doc, token)) {
            return;
         }

         if (event.key === 'Escape' && closeOnPressEsc) {
            active?.cancel('escape');
            return;
         }

         trapFocus(dialogFor(active?.id ?? ''), event);
      };

      // Focus that escapes the interactive stack programmatically (consumer
      // code focusing background elements) is pulled back into the top
      // dialog, restoring the element the user last focused inside it.
      const onFocusIn = (event: FocusEvent) => {
         const container = containerRef.current;
         const target = event.target as Node | null;

         if (!container) {
            return;
         }

         if (target && container.contains(target)) {
            lastFocusedRef.current =
               target instanceof HTMLElement ? target : null;
            return;
         }

         if (!hasKeyboardOwnership(doc, token) || !active) {
            return;
         }

         const dialog = dialogFor(active.id);
         const candidates = [
            lastFocusedRef.current,
            ...getFocusableElements(dialog),
         ];

         for (const candidate of candidates) {
            if (candidate?.isConnected) {
               candidate.focus();

               if (doc.activeElement === candidate) {
                  return;
               }
            }
         }

         dialog?.focus();
      };

      // iOS Safari scrolls the locked body on touch drags; cancel touches
      // that start outside this provider's stack while it owns interaction.
      // Touches inside the dialog keep scrolling its own content.
      const onTouchMove = (event: TouchEvent) => {
         if (!hasKeyboardOwnership(doc, token) || !event.cancelable) {
            return;
         }

         const container = containerRef.current;

         if (container && event.composedPath().includes(container)) {
            return;
         }

         event.preventDefault();
      };

      view.addEventListener('keydown', onKeyDown);
      doc.addEventListener('focusin', onFocusIn);
      doc.addEventListener('touchmove', onTouchMove, { passive: false });
      return () => {
         view.removeEventListener('keydown', onKeyDown);
         doc.removeEventListener('focusin', onFocusIn);
         doc.removeEventListener('touchmove', onTouchMove);
      };
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
         // The latest modal owns Escape/Tab and the top visual layer, even
         // when another provider already had modals open.
         applyLayer(containerRef.current, claimKeyboardOwnership(doc, token));

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
