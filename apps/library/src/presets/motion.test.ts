import { describe, expect, it } from 'vitest';
import { MODAL_POSITIONS } from '../configs/constant';
import { motionPresets } from './motion';

describe('motionPresets', () => {
   it('dialog uses centered fade and scale motion', () => {
      const preset = motionPresets.dialog();

      expect(preset.position).toBe(MODAL_POSITIONS.CENTER);
      expect(preset.motion.content.initial).toMatchObject({
         opacity: 0,
         scale: 0.96,
      });
      expect(preset.motion.content.animate).toMatchObject({
         opacity: 1,
         scale: 1,
      });
   });

   it('drawer defaults to the right and supports the left edge', () => {
      const right = motionPresets.drawer();
      const left = motionPresets.drawer({ side: 'left' });

      expect(right.position).toBe(MODAL_POSITIONS.RIGHT);
      expect(right.motion.content.initial).toMatchObject({ x: '100%' });
      expect(left.position).toBe(MODAL_POSITIONS.LEFT);
      expect(left.motion.content.initial).toMatchObject({ x: '-100%' });
   });

   it('sheet defaults to the bottom and supports the top edge', () => {
      const bottom = motionPresets.sheet();
      const top = motionPresets.sheet({ edge: 'top' });

      expect(bottom.position).toBe(MODAL_POSITIONS.BOTTOM);
      expect(bottom.motion.content.initial).toMatchObject({ y: '100%' });
      expect(top.position).toBe(MODAL_POSITIONS.TOP);
      expect(top.motion.content.initial).toMatchObject({ y: '-100%' });
   });
});
