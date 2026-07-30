const FOCUSABLE_SELECTOR = [
   'a[href]',
   'button:not([disabled])',
   'textarea:not([disabled])',
   'input:not([disabled])',
   'select:not([disabled])',
   '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Returns the visible, focusable elements within a container, in DOM order.
 * Used by the modal provider to trap Tab focus within the active dialog.
 */
export const getFocusableElements = (
   container: HTMLElement | null | undefined,
): HTMLElement[] => {
   if (!container) {
      return [];
   }

   return Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
   ).filter((element) => element.getClientRects().length > 0);
};

/**
 * Keeps keyboard focus inside the active dialog while it is open.
 */
export const trapFocus = (
   container: HTMLElement | null | undefined,
   event: KeyboardEvent,
) => {
   if (!container || event.key !== 'Tab') {
      return;
   }

   const focusableElements = getFocusableElements(container);
   const first = focusableElements[0];
   const last = focusableElements[focusableElements.length - 1];
   const focused = document.activeElement;

   if (!first || !last) {
      event.preventDefault();
      container.focus();
      return;
   }

   if (!focused || !container.contains(focused)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
   }

   if (event.shiftKey && focused === first) {
      event.preventDefault();
      last.focus();
   } else if (!event.shiftKey && focused === last) {
      event.preventDefault();
      first.focus();
   }
};
