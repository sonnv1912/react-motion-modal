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
} as const;

export type ModalPosition =
   (typeof MODAL_POSITIONS)[keyof typeof MODAL_POSITIONS];

export const MODAL_Z_INDEX = 1000;

export const MODAL_ENTER_TRANSITION = {
   duration: 0.24,
   ease: 'easeOut' as const,
};

export const MODAL_EXIT_TRANSITION = {
   duration: 0.18,
   ease: 'easeIn' as const,
};
