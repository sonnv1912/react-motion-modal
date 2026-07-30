import { MODAL_POSITIONS } from '@configs/constant';

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
