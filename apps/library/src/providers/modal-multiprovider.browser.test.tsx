import { userEvent } from '@vitest/browser/context';
import { act, type ReactElement, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineModal } from '../system/define-modal';
import { createModalSystem } from '../system/modal-system';
import type {
   ModalOpenOptions,
   ModalOutcome,
   ModalRenderProps,
   ModalSystem,
} from '../types/modal-system';
import '../assets/style/main.css';
import { ModalProvider } from './modal';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// NOTE: async act() must be awaited directly inside each `it` body. Awaiting
// it through another async function (helper or hook) corrupts the act scope
// in vitest browser mode and tears the React tree down mid-test.

type TestRegistry = ReturnType<typeof createTestSystem> extends ModalSystem<
   infer Registry
>
   ? Registry
   : never;

type ProviderHarness = {
   host: HTMLDivElement;
   portal: HTMLDivElement;
   root: Root;
   system: ModalSystem<TestRegistry>;
};

const StackModal = ({
   input,
}: ModalRenderProps<{ label: string }, void>): ReactElement => (
   <div>
      <button type='button'>{`${input.label}-first`}</button>
      <button type='button'>{`${input.label}-last`}</button>
   </div>
);

const createTestSystem = () =>
   createModalSystem({
      stack: defineModal({
         component: StackModal,
      }),
   });

const nextFrame = () =>
   new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const providers: ProviderHarness[] = [];

const mountProvider = (props?: {
   defaultOptions?: ModalOpenOptions;
   strict?: boolean;
}): ProviderHarness => {
   const host = document.createElement('div');
   document.body.append(host);
   const portal = document.createElement('div');
   document.body.append(portal);
   const root = createRoot(host);
   const system = createTestSystem();
   const provider = (
      <ModalProvider
         system={system}
         portalRoot={portal}
         defaultOptions={props?.defaultOptions}
      />
   );

   act(() => {
      root.render(
         props?.strict ? <StrictMode>{provider}</StrictMode> : provider,
      );
   });

   const harness = { host, portal, root, system };
   providers.push(harness);
   return harness;
};

const buttonFor = (
   portal: HTMLElement,
   label: string,
   which: 'first' | 'last',
): HTMLButtonElement | undefined =>
   Array.from(portal.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent === `${label}-${which}`,
   );

describe('ModalProvider multi-provider coordination', () => {
   afterEach(() => {
      for (const { host, portal, root } of providers.splice(0)) {
         act(() => root.unmount());
         portal.remove();
         host.remove();
      }

      document.body.style.overflow = '';
   });

   it('keeps body scroll locked until every provider releases its modals', async () => {
      document.body.style.overflow = 'auto';
      const first = mountProvider();
      const second = mountProvider();

      await act(async () => {
         void first.system.open('stack', { label: 'a' });
         await nextFrame();
         void second.system.open('stack', { label: 'b' });
         await nextFrame();
      });
      expect(document.body.style.overflow).toBe('hidden');

      await act(async () => {
         first.system.cancel();
         await nextFrame();
      });
      expect(document.body.style.overflow).toBe('hidden');

      await act(async () => {
         second.system.cancel();
         await nextFrame();
      });
      expect(document.body.style.overflow).toBe('auto');
   });

   it('restores the original overflow regardless of the closing order', async () => {
      document.body.style.overflow = 'scroll';
      const first = mountProvider();
      const second = mountProvider();

      await act(async () => {
         void second.system.open('stack', { label: 'b' });
         await nextFrame();
         void first.system.open('stack', { label: 'a' });
         await nextFrame();
      });

      await act(async () => {
         second.system.cancel();
         await nextFrame();
      });
      expect(document.body.style.overflow).toBe('hidden');

      await act(async () => {
         first.system.cancel();
         await nextFrame();
      });
      expect(document.body.style.overflow).toBe('scroll');
   });

   it('routes a single Escape to the most recently opened provider only', async () => {
      const first = mountProvider();
      const second = mountProvider();
      let firstOutcome: Promise<ModalOutcome<void>> | undefined;
      let secondOutcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         firstOutcome = first.system.open('stack', { label: 'a' });
         await nextFrame();
         secondOutcome = second.system.open('stack', { label: 'b' });
         await nextFrame();
      });

      await act(async () => {
         await userEvent.keyboard('{Escape}');
      });

      await expect(secondOutcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'escape',
      });
      expect(buttonFor(first.portal, 'a', 'first')).not.toBeUndefined();

      await act(async () => {
         first.system.cancelAll();
         await nextFrame();
      });
      await expect(firstOutcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'programmatic',
      });
   });

   it('does not let Escape fall through to other providers when the top modal opts out', async () => {
      const first = mountProvider();
      const second = mountProvider();
      let firstOutcome: Promise<ModalOutcome<void>> | undefined;
      let secondOutcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         firstOutcome = first.system.open('stack', { label: 'a' });
         await nextFrame();
         secondOutcome = second.system.open(
            'stack',
            { label: 'b' },
            {
               closeOnPressEsc: false,
            },
         );
         await nextFrame();
      });

      await act(async () => {
         await userEvent.keyboard('{Escape}');
      });

      expect(buttonFor(second.portal, 'b', 'first')).not.toBeUndefined();
      expect(buttonFor(first.portal, 'a', 'first')).not.toBeUndefined();

      await act(async () => {
         first.system.cancelAll();
         second.system.cancelAll();
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
   });

   it('keeps Tab focus inside the top dialog across providers', async () => {
      const first = mountProvider();
      const second = mountProvider();

      await act(async () => {
         void first.system.open('stack', { label: 'a' });
         await nextFrame();
         void second.system.open('stack', { label: 'b' });
         await nextFrame();
      });

      buttonFor(second.portal, 'b', 'last')?.focus();
      await act(async () => {
         await userEvent.tab();
      });

      expect(document.activeElement).toBe(
         buttonFor(second.portal, 'b', 'first'),
      );
   });

   it('traps Tab inside the dialog of the most recently opened provider', async () => {
      const first = mountProvider();
      const second = mountProvider();

      await act(async () => {
         void second.system.open('stack', { label: 'second' });
         await nextFrame();
         void first.system.open('stack', { label: 'first' });
         await nextFrame();
      });

      buttonFor(first.portal, 'first', 'last')?.focus();
      await act(async () => {
         await userEvent.tab();
      });

      expect(document.activeElement).toBe(
         buttonFor(first.portal, 'first', 'first'),
      );
   });

   it('restores focus into the underlying dialog when the top modal closes', async () => {
      const first = mountProvider();
      const second = mountProvider();

      await act(async () => {
         void first.system.open('stack', { label: 'a' });
         await nextFrame();
      });

      const underlyingButton = buttonFor(first.portal, 'a', 'last');
      underlyingButton?.focus();

      await act(async () => {
         void second.system.open('stack', { label: 'b' });
         await nextFrame();
      });
      expect(document.activeElement).toBe(
         buttonFor(second.portal, 'b', 'first'),
      );

      await act(async () => {
         second.system.cancel();
         await nextFrame();
      });

      expect(document.activeElement).toBe(underlyingButton);
   });

   it('returns focus to the trigger after the last modal closes', async () => {
      const trigger = document.createElement('button');
      trigger.textContent = 'Trigger';
      document.body.append(trigger);
      trigger.focus();

      const harness = mountProvider();
      let outcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         outcome = harness.system.open('stack', { label: 'a' });
         await nextFrame();
      });

      await act(async () => {
         harness.system.cancel();
         await nextFrame();
      });

      expect(document.activeElement).toBe(trigger);
      await expect(outcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'programmatic',
      });
      trigger.remove();
   });

   it('marks exiting modals inert until their DOM is removed', async () => {
      const harness = mountProvider();
      let outcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         outcome = harness.system.open('stack', { label: 'a' });
         await nextFrame();
      });

      await act(async () => {
         harness.system.cancel();
         await nextFrame();
      });

      const exiting =
         harness.portal.querySelector<HTMLElement>('[data-modal-id]');
      expect(exiting).not.toBeNull();
      expect(exiting?.getAttribute('aria-hidden')).toBe('true');
      expect(exiting?.closest('[inert]')).not.toBeNull();

      await vi.waitFor(() => {
         expect(harness.portal.querySelector('[data-modal-id]')).toBeNull();
      });
      await expect(outcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'programmatic',
      });
   });

   it('hands interaction to a modal opened while another one exits', async () => {
      const harness = mountProvider();
      let exitingOutcome: Promise<ModalOutcome<void>> | undefined;
      let enteredOutcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         exitingOutcome = harness.system.open('stack', { label: 'a' });
         await nextFrame();
      });

      await act(async () => {
         harness.system.cancel();
         enteredOutcome = harness.system.open('stack', { label: 'b' });
         await nextFrame();
      });

      const exiting = harness.portal.querySelector<HTMLElement>(
         '[data-modal-id][aria-hidden="true"]',
      );
      const activeDialog = harness.portal.querySelector<HTMLElement>(
         '[role="dialog"][aria-modal="true"]',
      );
      expect(exiting).not.toBeNull();
      expect(exiting?.closest('[inert]')).not.toBeNull();
      expect(activeDialog).not.toBeNull();
      expect(document.activeElement).toBe(
         buttonFor(harness.portal, 'b', 'first'),
      );

      await act(async () => {
         await userEvent.keyboard('{Escape}');
      });
      await expect(enteredOutcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'escape',
      });
      await expect(exitingOutcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'programmatic',
      });
   });

   it('returns keyboard ownership to the remaining provider after one unmounts', async () => {
      document.body.style.overflow = 'auto';
      const first = mountProvider();
      const second = mountProvider();
      let firstOutcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         firstOutcome = first.system.open('stack', { label: 'a' });
         await nextFrame();
         void second.system.open('stack', { label: 'b' });
         await nextFrame();
      });

      act(() => second.root.unmount());

      expect(document.body.style.overflow).toBe('hidden');

      await act(async () => {
         await userEvent.keyboard('{Escape}');
      });
      await expect(firstOutcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'escape',
      });
      expect(document.body.style.overflow).toBe('auto');
   });

   it('cancels every system exactly once on history navigation', async () => {
      const first = mountProvider();
      const second = mountProvider();
      let firstOutcome: Promise<ModalOutcome<void>> | undefined;
      let secondOutcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         firstOutcome = first.system.open('stack', { label: 'a' });
         await nextFrame();
         secondOutcome = second.system.open('stack', { label: 'b' });
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
      expect(document.body.style.overflow).toBe('');
   });

   it('survives a Strict Mode remount without cancelling pending flows', async () => {
      document.body.style.overflow = 'auto';
      const harness = mountProvider({ strict: true });
      let outcome: Promise<ModalOutcome<void>> | undefined;

      await act(async () => {
         outcome = harness.system.open('stack', { label: 'a' });
         await nextFrame();
      });

      expect(buttonFor(harness.portal, 'a', 'first')).not.toBeUndefined();
      expect(document.body.style.overflow).toBe('hidden');

      await act(async () => {
         harness.system.cancel();
         await nextFrame();
      });

      await expect(outcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'programmatic',
      });
      expect(document.body.style.overflow).toBe('auto');
   });

   it('moves the portal without breaking the scroll lock', async () => {
      document.body.style.overflow = 'auto';
      const harness = mountProvider();
      const secondPortal = document.createElement('div');
      document.body.append(secondPortal);

      try {
         await act(async () => {
            void harness.system.open('stack', { label: 'a' });
            await nextFrame();
         });

         await act(async () => {
            harness.root.render(
               <ModalProvider
                  system={harness.system}
                  portalRoot={secondPortal}
               />,
            );
            await nextFrame();
         });

         expect(secondPortal.querySelector('[role="dialog"]')).not.toBeNull();
         expect(harness.portal.querySelector('[role="dialog"]')).toBeNull();
         expect(document.body.style.overflow).toBe('hidden');

         await act(async () => {
            harness.system.cancel();
            await nextFrame();
         });
         expect(document.body.style.overflow).toBe('auto');
      } finally {
         secondPortal.remove();
      }
   });

   it('locks scroll and handles Escape inside the portal document', async () => {
      document.body.style.overflow = 'auto';
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      const iframeDoc = iframe.contentDocument;
      const frameWindow = iframe.contentWindow as
         | (Window & typeof globalThis)
         | null;

      if (!iframeDoc || !frameWindow) {
         iframe.remove();
         return;
      }

      const host = document.createElement('div');
      document.body.append(host);
      const root = createRoot(host);
      const system = createTestSystem();
      let outcome: Promise<ModalOutcome<void>> | undefined;

      try {
         iframeDoc.body.style.overflow = 'scroll';

         act(() => {
            root.render(
               <ModalProvider system={system} portalRoot={iframeDoc.body} />,
            );
         });

         await act(async () => {
            outcome = system.open('stack', { label: 'frame' });
            await nextFrame();
         });

         expect(iframeDoc.querySelector('[role="dialog"]')).not.toBeNull();
         expect(iframeDoc.body.style.overflow).toBe('hidden');
         expect(document.body.style.overflow).toBe('auto');

         await act(async () => {
            frameWindow.dispatchEvent(
               new frameWindow.KeyboardEvent('keydown', { key: 'Escape' }),
            );
            await nextFrame();
         });

         await expect(outcome).resolves.toEqual({
            status: 'cancelled',
            reason: 'escape',
         });
         expect(iframeDoc.body.style.overflow).toBe('scroll');
      } finally {
         act(() => root.unmount());
         host.remove();
         iframe.remove();
      }
   });
});
