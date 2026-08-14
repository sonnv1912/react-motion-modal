import { MODAL_POSITIONS } from '@configs/constant';
import { page, userEvent } from '@vitest/browser/context';
import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defineModal } from '../system/define-modal';
import { createModalSystem } from '../system/modal-system';
import type {
   ModalOutcome,
   ModalRenderProps,
   ModalSystem,
} from '../types/modal-system';
import '../assets/style/main.css';
import { ModalProvider } from './modal';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

type TestRegistry = ReturnType<typeof createTestSystem> extends ModalSystem<
   infer Registry
>
   ? Registry
   : never;

const TestModal = ({ cancel }: ModalRenderProps<void, void>): ReactElement => (
   <div>
      <button type='button'>First action</button>
      <button type='button' onClick={() => cancel()}>
         Last action
      </button>
   </div>
);

const ResponsiveModal = (): ReactElement => (
   <div style={{ width: 340, height: 400 }}>Responsive modal content</div>
);

const OversizedModal = (): ReactElement => (
   <div style={{ width: 280, height: 800 }}>Oversized modal content</div>
);

function createTestSystem() {
   return createModalSystem({
      test: defineModal({
         component: TestModal,
      }),
      responsive: defineModal({
         component: ResponsiveModal,
      }),
      oversized: defineModal({
         component: OversizedModal,
      }),
   });
}

const nextFrame = () =>
   new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe('ModalProvider', () => {
   let host: HTMLDivElement;
   let root: Root;
   let system: ModalSystem<TestRegistry>;
   let trigger: HTMLButtonElement | undefined;

   beforeEach(() => {
      system = createTestSystem();
      host = document.createElement('div');
      document.body.append(host);
      root = createRoot(host);
   });

   afterEach(async () => {
      await act(async () => root.unmount());
      trigger?.remove();
      trigger = undefined;
      host.remove();
      document.body.style.overflow = '';
      await page.viewport(1024, 768);
   });

   it('renders a modal that was opened before the provider mounted', async () => {
      system.open('test');

      await act(async () => {
         root.render(<ModalProvider system={system} />);
         await nextFrame();
      });

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      const firstButton = dialog?.querySelector('button');

      expect(dialog).not.toBeNull();
      expect(document.activeElement).toBe(firstButton);
   });

   it('keeps Tab focus inside the active dialog', async () => {
      trigger = document.createElement('button');
      trigger.textContent = 'Open modal';
      document.body.prepend(trigger);
      trigger.focus();

      await act(async () => {
         root.render(<ModalProvider system={system} />);
         await nextFrame();
      });

      await act(async () => {
         system.open('test');
         await nextFrame();
      });

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      const buttons = dialog?.querySelectorAll<HTMLButtonElement>('button');
      const first = buttons?.[0];
      const last = buttons?.[1];

      expect(document.activeElement).toBe(first);

      first?.focus();
      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(last);

      last?.focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(first);
   });

   it('uses default and custom accessible names', async () => {
      await act(async () => {
         root.render(<ModalProvider system={system} />);
         await nextFrame();
      });

      await act(async () => {
         system.open('test');
         await nextFrame();
      });

      let dialog = document.querySelector<HTMLElement>(
         '[role="dialog"][aria-modal="true"]',
      );
      expect(dialog?.getAttribute('aria-label')).toBe('Modal');

      await act(async () => {
         system.cancel();
         system.open('test', undefined, {
            ariaLabel: 'Account settings',
         });
         await nextFrame();
      });

      dialog = document.querySelector<HTMLElement>(
         '[role="dialog"][aria-modal="true"]',
      );
      expect(dialog?.getAttribute('aria-label')).toBe('Account settings');
   });

   it('settles backdrop and Escape cancellations with their source', async () => {
      await act(async () => {
         root.render(<ModalProvider system={system} />);
         await nextFrame();
      });

      let backdropOutcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         backdropOutcome = system.open('test');
         await nextFrame();
      });

      const backdrop = document.querySelector<HTMLElement>(
         '.react-motion-modal__backdrop',
      );

      await act(async () => backdrop?.click());
      await expect(backdropOutcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'backdrop',
      });

      let escapeOutcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         escapeOutcome = system.open('test');
         await nextFrame();
      });
      await act(async () => userEvent.keyboard('{Escape}'));
      await expect(escapeOutcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'escape',
      });
   });

   it('cancels the full modal stack on browser history navigation', async () => {
      await act(async () => {
         root.render(<ModalProvider system={system} />);
         await nextFrame();
      });

      let firstOutcome: Promise<ModalOutcome<void>> | undefined;
      let secondOutcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         firstOutcome = system.open('test');
         secondOutcome = system.open('test');
         await nextFrame();
      });

      await act(async () => {
         window.dispatchEvent(new PopStateEvent('popstate'));
         await nextFrame();
      });

      await expect(firstOutcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'programmatic',
      });
      await expect(secondOutcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'programmatic',
      });
      expect(
         document.querySelector('[role="dialog"][aria-modal="true"]'),
      ).toBeNull();
   });

   it('locks background scroll and restores it when the stack empties', async () => {
      document.body.style.overflow = 'scroll';

      await act(async () => {
         root.render(<ModalProvider system={system} />);
         await nextFrame();
         system.open('test');
         await nextFrame();
      });

      expect(document.body.style.overflow).toBe('hidden');

      await act(async () => {
         system.cancel();
         await nextFrame();
      });

      expect(document.body.style.overflow).toBe('scroll');
   });

   it('cancels pending flows when its provider unmounts', async () => {
      await act(async () => {
         root.render(<ModalProvider system={system} />);
         await nextFrame();
      });
      let outcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         outcome = system.open('test');
         await nextFrame();
      });

      await act(async () => {
         root.unmount();
         await Promise.resolve();
      });

      await expect(outcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'provider-unmounted',
      });

      root = createRoot(host);
   });

   it('does not squeeze positioned modals into half-viewports on small screens', async () => {
      await page.viewport(360, 640);

      await act(async () => {
         root.render(<ModalProvider system={system} />);
         await nextFrame();
      });

      const positions = Object.values(MODAL_POSITIONS).filter(
         (position) => position !== MODAL_POSITIONS.CENTER_FULL,
      );

      for (const position of positions) {
         await act(async () => {
            system.open('responsive', undefined, { position });
            await nextFrame();
         });

         const dialog = document.querySelector<HTMLElement>(
            '[role="dialog"][aria-modal="true"]',
         );
         const bounds = dialog?.getBoundingClientRect();

         expect(bounds?.width, `${position} width`).toBeGreaterThanOrEqual(340);

         if (
            position !== MODAL_POSITIONS.LEFT &&
            position !== MODAL_POSITIONS.RIGHT
         ) {
            expect(bounds?.height, `${position} height`).toBeGreaterThanOrEqual(
               400,
            );
         }

         await act(async () => {
            system.cancelAll();
            await nextFrame();
         });
      }
   });

   it('does not show horizontal scrollbars caused by position animations', async () => {
      await page.viewport(360, 640);

      await act(async () => {
         root.render(<ModalProvider system={system} />);
         await nextFrame();
      });

      await act(async () => {
         system.open('oversized', undefined, {
            position: MODAL_POSITIONS.TOP_RIGHT,
         });
         await nextFrame();
      });

      const dialog = document.querySelector<HTMLElement>(
         '[role="dialog"][aria-modal="true"]',
      );

      expect(dialog).not.toBeNull();

      if (!dialog) {
         return;
      }

      const style = getComputedStyle(dialog);

      expect(style.overflowX).toBe('hidden');
      expect(style.overflowY).toBe('auto');
      expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
   });
});
