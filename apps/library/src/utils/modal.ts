import {
   MODAL_BODY_ANIMATION_VISIBLE,
   MODAL_EXIT_TRANSITION,
   MODAL_POSITIONS,
} from '@configs/constant';
import type { TargetAndTransition } from 'motion';

type BodyAnimation = {
   initial: TargetAndTransition;
   animate: TargetAndTransition;
   exit: TargetAndTransition;
};

const getSlideAnimation = (
   x: string | number,
   y: string | number,
): BodyAnimation => {
   const hidden: TargetAndTransition = {
      opacity: 0,
      x,
      y,
      transition: MODAL_EXIT_TRANSITION,
   };

   return {
      initial: hidden,
      animate: MODAL_BODY_ANIMATION_VISIBLE,
      exit: hidden,
   };
};

export const getModalBodyAnimation = (position: string): BodyAnimation => {
   switch (position) {
      case MODAL_POSITIONS.LEFT:
         return getSlideAnimation('-100%', 0);
      case MODAL_POSITIONS.RIGHT:
         return getSlideAnimation('100%', 0);
      case MODAL_POSITIONS.TOP:
      case MODAL_POSITIONS.TOP_CENTER:
         return getSlideAnimation(0, '-100%');
      case MODAL_POSITIONS.BOTTOM:
      case MODAL_POSITIONS.BOTTOM_CENTER:
         return getSlideAnimation(0, '100%');
      case MODAL_POSITIONS.TOP_LEFT:
         return getSlideAnimation('-100%', '-100%');
      case MODAL_POSITIONS.TOP_RIGHT:
         return getSlideAnimation('100%', '-100%');
      case MODAL_POSITIONS.BOTTOM_LEFT:
         return getSlideAnimation('-100%', '100%');
      case MODAL_POSITIONS.BOTTOM_RIGHT:
         return getSlideAnimation('100%', '100%');
      case MODAL_POSITIONS.CENTER:
         return {
            initial: {
               opacity: 0,
               scale: 0.96,
            },
            animate: MODAL_BODY_ANIMATION_VISIBLE,
            exit: {
               opacity: 0,
               scale: 0.96,
               transition: MODAL_EXIT_TRANSITION,
            },
         };
      case MODAL_POSITIONS.CENTER_FULL:
         return {
            initial: {
               opacity: 0,
            },
            animate: MODAL_BODY_ANIMATION_VISIBLE,
            exit: {
               opacity: 0,
               transition: MODAL_EXIT_TRANSITION,
            },
         };
      default:
         return getModalBodyAnimation(MODAL_POSITIONS.CENTER);
   }
};

export const getModalBodyPositionClassName = (position: string): string => {
   switch (position) {
      case MODAL_POSITIONS.TOP:
         return 'react-motion-modal__body--top';
      case MODAL_POSITIONS.TOP_LEFT:
         return 'react-motion-modal__body--top-left';
      case MODAL_POSITIONS.TOP_RIGHT:
         return 'react-motion-modal__body--top-right';
      case MODAL_POSITIONS.TOP_CENTER:
         return 'react-motion-modal__body--top-center';
      case MODAL_POSITIONS.BOTTOM:
         return 'react-motion-modal__body--bottom';
      case MODAL_POSITIONS.BOTTOM_LEFT:
         return 'react-motion-modal__body--bottom-left';
      case MODAL_POSITIONS.BOTTOM_RIGHT:
         return 'react-motion-modal__body--bottom-right';
      case MODAL_POSITIONS.BOTTOM_CENTER:
         return 'react-motion-modal__body--bottom-center';
      case MODAL_POSITIONS.LEFT:
         return 'react-motion-modal__body--left';
      case MODAL_POSITIONS.RIGHT:
         return 'react-motion-modal__body--right';
      case MODAL_POSITIONS.CENTER:
         return 'react-motion-modal__body--center';
      case MODAL_POSITIONS.CENTER_FULL:
         return 'react-motion-modal__body--center-full';
      default:
         return getModalBodyPositionClassName(MODAL_POSITIONS.CENTER);
   }
};
