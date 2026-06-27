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
