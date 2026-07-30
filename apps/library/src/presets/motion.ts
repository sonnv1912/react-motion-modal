import {
   MODAL_ENTER_TRANSITION,
   MODAL_EXIT_TRANSITION,
   MODAL_POSITIONS,
} from '../configs/constant';
import type { ModalMotion, ModalMotionPreset } from '../types/modal-system';

const backdrop = {
   initial: { opacity: 0 },
   animate: {
      opacity: 1,
      transition: MODAL_ENTER_TRANSITION,
   },
   exit: {
      opacity: 0,
      transition: MODAL_EXIT_TRANSITION,
   },
};

const createSlideMotion = ({
   x = 0,
   y = 0,
}: {
   x?: string | number;
   y?: string | number;
}): ModalMotion => ({
   backdrop,
   content: {
      initial: { opacity: 0, x, y },
      animate: {
         opacity: 1,
         x: 0,
         y: 0,
         transition: MODAL_ENTER_TRANSITION,
      },
      exit: {
         opacity: 0,
         x,
         y,
         transition: MODAL_EXIT_TRANSITION,
      },
   },
});

export const motionPresets = {
   dialog: (): ModalMotionPreset => ({
      position: MODAL_POSITIONS.CENTER,
      motion: {
         backdrop,
         content: {
            initial: { opacity: 0, scale: 0.96 },
            animate: {
               opacity: 1,
               scale: 1,
               transition: MODAL_ENTER_TRANSITION,
            },
            exit: {
               opacity: 0,
               scale: 0.96,
               transition: MODAL_EXIT_TRANSITION,
            },
         },
      },
   }),
   drawer: (options: { side?: 'left' | 'right' } = {}): ModalMotionPreset => {
      const side = options.side ?? 'right';

      return {
         position:
            side === 'left' ? MODAL_POSITIONS.LEFT : MODAL_POSITIONS.RIGHT,
         motion: createSlideMotion({
            x: side === 'left' ? '-100%' : '100%',
         }),
      };
   },
   sheet: (options: { edge?: 'top' | 'bottom' } = {}): ModalMotionPreset => {
      const edge = options.edge ?? 'bottom';

      return {
         position:
            edge === 'top' ? MODAL_POSITIONS.TOP : MODAL_POSITIONS.BOTTOM,
         motion: createSlideMotion({
            y: edge === 'top' ? '-100%' : '100%',
         }),
      };
   },
};
