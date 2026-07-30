import { describe, expect, it } from 'vitest';
import {
   appendLabEvent,
   formatLabOutcome,
   getRecommendedPosition,
} from './modal-lab.model';

describe('Modal Lab model', () => {
   it.each([
      ['dialog', 'center'],
      ['drawer', 'right'],
      ['sheet', 'bottom'],
   ] as const)(
      'recommends %s position for the %s preset',
      (preset, position) => {
         expect(getRecommendedPosition(preset)).toBe(position);
      },
   );

   it('prepends new events and keeps the newest eight', () => {
      const events = Array.from({ length: 8 }, (_, index) => ({
         id: index,
         message: `event ${index}`,
      }));

      expect(appendLabEvent(events, 'latest event', 9)).toEqual([
         { id: 9, message: 'latest event' },
         ...events.slice(0, 7),
      ]);
   });

   it('formats resolved values for each scenario', () => {
      expect(
         formatLabOutcome('confirm', {
            status: 'resolved',
            value: { kind: 'confirm', confirmed: true },
         }),
      ).toBe('confirm resolved · confirmed');

      expect(
         formatLabOutcome('form', {
            status: 'resolved',
            value: { kind: 'form', name: 'Sơn' },
         }),
      ).toBe('form resolved · Sơn');

      expect(
         formatLabOutcome('nested', {
            status: 'resolved',
            value: { kind: 'nested', inspected: true },
         }),
      ).toBe('nested resolved · inspected');
   });

   it('includes the cancellation reason', () => {
      expect(
         formatLabOutcome('confirm', {
            status: 'cancelled',
            reason: 'escape',
         }),
      ).toBe('confirm cancelled · escape');
   });
});
