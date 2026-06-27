import { beforeEach, describe, expect, it, vi } from 'vitest';
import { modalStore } from './modal';

// ModalDefinition is empty by default, so ModalName resolves to `never` and the
// typed actions can't accept any name. The actions are stable references, so we
// read them through a loose type for testing the runtime behavior.
type LooseActions = {
   openModal: (name: string, params?: Record<string, unknown>) => void;
   closeModal: (name?: string) => void;
   closeAllModal: () => void;
};

const getActions = () => modalStore.getState() as unknown as LooseActions;

describe('modalStore', () => {
   beforeEach(() => {
      modalStore.getState().closeAllModal();
   });

   it('openModal pushes a modal onto the stack and marks it active', () => {
      getActions().openModal('alert');

      const { modals, active } = modalStore.getState();

      expect(modals).toHaveLength(1);
      expect(active?.name).toBe('alert');
   });

   it('openModal injects a closeModal bound to the modal name', () => {
      getActions().openModal('alert');

      const state = modalStore.getState() as unknown as {
         active?: { params?: { closeModal?: () => void } };
      };
      const closeModal = state.active?.params?.closeModal;

      expect(typeof closeModal).toBe('function');

      closeModal?.();

      expect(modalStore.getState().modals).toHaveLength(0);
   });

   it('closeModal() removes the topmost modal and updates active', () => {
      const actions = getActions();

      actions.openModal('a');
      actions.openModal('b');
      actions.closeModal();

      const state = modalStore.getState();

      expect(state.modals).toHaveLength(1);
      expect(state.active?.name).toBe('a');
   });

   it('closeModal(name) removes the first modal with that name', () => {
      const actions = getActions();

      actions.openModal('a');
      actions.openModal('b');
      actions.closeModal('a');

      const state = modalStore.getState();

      expect(state.modals.map((modal) => modal.name)).toEqual(['b']);
      expect(state.active?.name).toBe('b');
   });

   it('closeModal(name) keeps the real topmost modal active', () => {
      const actions = getActions();

      actions.openModal('a');
      actions.openModal('b');
      actions.openModal('c');
      actions.closeModal('a');

      const state = modalStore.getState();

      expect(state.modals.map((modal) => modal.name)).toEqual(['b', 'c']);
      expect(state.active?.name).toBe('c');
   });

   it('invokes onClose exactly once when the modal is closed', () => {
      const onClose = vi.fn();
      const actions = getActions();

      actions.openModal('alert', { onClose });
      actions.closeModal();

      expect(onClose).toHaveBeenCalledTimes(1);
   });

   it('closeAllModal clears the entire stack', () => {
      const actions = getActions();

      actions.openModal('a');
      actions.openModal('b');
      actions.closeAllModal();

      const state = modalStore.getState();

      expect(state.modals).toHaveLength(0);
      expect(state.active).toBeUndefined();
   });
});
