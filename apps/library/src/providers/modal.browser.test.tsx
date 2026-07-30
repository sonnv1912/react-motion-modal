import { modalStore } from '@stores/modal';
import { userEvent } from '@vitest/browser/context';
import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ModalComponent } from '#types/modal';
import { ModalProvider } from './modal';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

type LooseActions = {
   openModal: (name: string, params?: Record<string, unknown>) => void;
   closeAllModal: () => void;
};

type TestModalProps = {
   closeModal: () => void;
};

const TestModal: ModalComponent<TestModalProps> = ({
   closeModal,
}): ReactElement => (
   <div>
      <button type='button'>First action</button>
      <button type='button' onClick={closeModal}>
         Last action
      </button>
   </div>
);

const modals = {
   test: TestModal,
};

const getActions = () => modalStore.getState() as unknown as LooseActions;

const nextFrame = () =>
   new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe('ModalProvider', () => {
   let host: HTMLDivElement;
   let root: Root;
   let trigger: HTMLButtonElement | undefined;

   beforeEach(() => {
      getActions().closeAllModal();
      host = document.createElement('div');
      document.body.append(host);
      root = createRoot(host);
   });

   afterEach(async () => {
      await act(async () => root.unmount());
      trigger?.remove();
      trigger = undefined;
      host.remove();
      getActions().closeAllModal();
      document.body.style.overflow = '';
   });

   it('renders a modal that was opened before the provider mounted', async () => {
      getActions().openModal('test');

      await act(async () => {
         root.render(<ModalProvider modals={modals} />);
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
         root.render(<ModalProvider modals={modals} />);
         await nextFrame();
      });

      await act(async () => {
         getActions().openModal('test');
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

   it('gives the dialog a default accessible name', async () => {
      await act(async () => {
         root.render(<ModalProvider modals={modals} />);
         await nextFrame();
      });

      await act(async () => {
         getActions().openModal('test');
         await nextFrame();
      });

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');

      expect(dialog?.getAttribute('aria-label')).toBe('Modal');
   });

   it('uses the custom accessible name when provided', async () => {
      await act(async () => {
         root.render(<ModalProvider modals={modals} />);
         await nextFrame();
      });

      await act(async () => {
         getActions().openModal('test', { ariaLabel: 'Account settings' });
         await nextFrame();
      });

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');

      expect(dialog?.getAttribute('aria-label')).toBe('Account settings');
   });
});
