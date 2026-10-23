import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ModalOutcome, ModalRenderProps } from '../types/modal-system';
import { defineModal } from './define-modal';
import {
   attachModalProvider,
   createModalSystem,
   getModalSystemStore,
} from './modal-system';

type ConfirmInput = {
   title: string;
};

const ConfirmModal = ({ input }: ModalRenderProps<ConfirmInput, boolean>) =>
   input.title;

const createTestSystem = () =>
   createModalSystem({
      alert: defineModal({
         component: (_props: ModalRenderProps<{ message: string }, void>) =>
            null,
      }),
      confirm: defineModal({
         component: ConfirmModal,
      }),
      replaceable: defineModal({
         component: ConfirmModal,
         policy: 'replace',
      }),
      singleton: defineModal({
         component: ConfirmModal,
         policy: 'singleton',
      }),
   });

describe('createModalSystem', () => {
   it('infers each modal input and outcome from its definition', () => {
      const system = createTestSystem();

      const assertTypes = () => {
         const outcome = system.open('confirm', { title: 'Delete item?' });

         expectTypeOf(outcome).toEqualTypeOf<Promise<ModalOutcome<boolean>>>();

         system.open('alert', { message: 'Saved' });

         // @ts-expect-error confirm requires a title
         system.open('confirm', {});
         // @ts-expect-error unknown modal names are rejected
         system.open('missing', {});
      };

      expectTypeOf(assertTypes).toBeFunction();
   });

   it('stores the input for a newly opened modal', () => {
      const system = createTestSystem();

      system.open('confirm', { title: 'Delete item?' });

      const { activeModals } = getModalSystemStore(system).getState();

      expect(activeModals).toHaveLength(1);
      expect(activeModals[0]?.name).toBe('confirm');
      expect(activeModals[0]?.input).toEqual({ title: 'Delete item?' });
   });

   it('settles an open operation exactly once when resolved', async () => {
      const system = createTestSystem();
      const outcome = system.open('confirm', { title: 'Delete item?' });
      const instance = getModalSystemStore(system).getState().activeModals[0];

      instance?.resolve(true);
      instance?.cancel('programmatic');

      await expect(outcome).resolves.toEqual({
         status: 'resolved',
         value: true,
      });
      expect(getModalSystemStore(system).getState().activeModals).toHaveLength(
         0,
      );
   });

   it('cancels the top operation with an explicit reason', async () => {
      const system = createTestSystem();
      const outcome = system.open('confirm', { title: 'Delete item?' });

      system.cancel('escape');

      await expect(outcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'escape',
      });
   });

   it('replace cancels the active modal before opening the next one', async () => {
      const system = createTestSystem();
      const first = system.open('confirm', { title: 'First' });

      system.open('replaceable', { title: 'Second' });

      await expect(first).resolves.toEqual({
         status: 'cancelled',
         reason: 'replaced',
      });
      expect(
         getModalSystemStore(system)
            .getState()
            .activeModals.map((modal) => modal.name),
      ).toEqual(['replaceable']);
   });

   it('replace cancels only the top-most modal and keeps deeper entries', async () => {
      const system = createTestSystem();
      const first = system.open('confirm', { title: 'First' });
      const second = system.open('confirm', { title: 'Second' });
      const third = system.open('replaceable', { title: 'Third' });

      await expect(second).resolves.toEqual({
         status: 'cancelled',
         reason: 'replaced',
      });
      expect(
         getModalSystemStore(system)
            .getState()
            .activeModals.map((modal) => modal.name),
      ).toEqual(['confirm', 'replaceable']);

      system.cancelAll('programmatic');

      await expect(first).resolves.toEqual({
         status: 'cancelled',
         reason: 'programmatic',
      });
      await expect(third).resolves.toEqual({
         status: 'cancelled',
         reason: 'programmatic',
      });
   });

   it('singleton returns the same in-flight promise and instance', () => {
      const system = createTestSystem();

      const first = system.open('singleton', { title: 'First' });
      const second = system.open(
         'singleton',
         { title: 'Second' },
         {
            ariaLabel: 'Second attempt',
         },
      );

      expect(second).toBe(first);
      expect(getModalSystemStore(system).getState().activeModals).toHaveLength(
         1,
      );
      expect(
         getModalSystemStore(system).getState().activeModals[0]?.input,
      ).toEqual({ title: 'First' });
      expect(
         getModalSystemStore(system).getState().activeModals[0]?.options,
      ).toBeUndefined();
   });

   it('keeps state isolated between system instances', () => {
      const first = createTestSystem();
      const second = createTestSystem();

      first.open('confirm', { title: 'First' });

      expect(getModalSystemStore(first).getState().activeModals).toHaveLength(
         1,
      );
      expect(getModalSystemStore(second).getState().activeModals).toHaveLength(
         0,
      );
   });

   it('throws a useful runtime error for an unknown modal name', () => {
      const system = createTestSystem();
      const openUnknown = system.open as (
         name: string,
         input: unknown,
      ) => Promise<unknown>;

      expect(() => openUnknown('missing', {})).toThrow(
         'Unknown modal "missing".',
      );
   });

   it('keeps flows alive across a Strict Mode style provider remount', async () => {
      const system = createTestSystem();
      const firstDetach = attachModalProvider(system);
      const outcome = system.open('confirm', { title: 'Delete item?' });
      let didSettle = false;
      void outcome.then(() => {
         didSettle = true;
      });

      firstDetach();
      const finalDetach = attachModalProvider(system);
      await Promise.resolve();

      expect(didSettle).toBe(false);

      finalDetach();

      await expect(outcome).resolves.toEqual({
         status: 'cancelled',
         reason: 'provider-unmounted',
      });
   });
});
