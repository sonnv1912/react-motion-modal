import type { TargetAndTransition } from 'motion';

export const MODAL_POSITIONS = {
   TOP: 'top',
   TOP_LEFT: 'top-left',
   TOP_RIGHT: 'top-right',
   TOP_CENTER: 'top-center',
   LEFT: 'left',
   RIGHT: 'right',
   CENTER: 'center',
   CENTER_FULL: 'center-full',
   BOTTOM: 'bottom',
   BOTTOM_LEFT: 'bottom-left',
   BOTTOM_RIGHT: 'bottom-right',
   BOTTOM_CENTER: 'bottom-center',
};

export const MODAL_Z_INDEX = 1000;

export const MODAL_ENTER_TRANSITION = {
   duration: 0.24,
   ease: 'easeOut' as const,
};

export const MODAL_EXIT_TRANSITION = {
   duration: 0.18,
   ease: 'easeIn' as const,
};

export const MODAL_BODY_ANIMATION_VISIBLE: TargetAndTransition = {
   opacity: 1,
   scale: 1,
   x: 0,
   y: 0,
   transition: MODAL_ENTER_TRANSITION,
};
