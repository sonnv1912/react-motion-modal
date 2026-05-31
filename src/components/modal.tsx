import { MODAL_POSITIONS } from '@configs/constant';
import { useModal } from '@hooks/store/use-modal';
import clsx from 'clsx';
import { motion } from 'motion/react';
import type { TargetAndTransition } from 'motion';
import type {
   ActiveModal,
   BaseModalParams,
   ModalConfig,
} from '#types/modal.type';

type Props = {
   data: ActiveModal;
   modals: ModalConfig;
   index: number;
   initialParams?: Partial<BaseModalParams>;
};

const Z_INDEX = 1000;
const ENTER_TRANSITION = {
   duration: 0.24,
   ease: 'easeOut' as const,
};
const EXIT_TRANSITION = {
   duration: 0.18,
   ease: 'easeIn' as const,
};
const BODY_ANIMATION_VISIBLE: TargetAndTransition = {
   opacity: 1,
   scale: 1,
   x: 0,
   y: 0,
   transition: ENTER_TRANSITION,
};
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
      transition: EXIT_TRANSITION,
   };

   return {
      initial: hidden,
      animate: BODY_ANIMATION_VISIBLE,
      exit: hidden,
   };
};

const getModalBodyAnimation = (position: string): BodyAnimation => {
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
            animate: BODY_ANIMATION_VISIBLE,
            exit: {
               opacity: 0,
               scale: 0.96,
               transition: EXIT_TRANSITION,
            },
         };
      case MODAL_POSITIONS.CENTER_FULL:
         return {
            initial: {
               opacity: 0,
            },
            animate: BODY_ANIMATION_VISIBLE,
            exit: {
               opacity: 0,
               transition: EXIT_TRANSITION,
            },
         };
      default:
         return getModalBodyAnimation(MODAL_POSITIONS.CENTER);
   }
};

const getModalBodyPositionClassName = (position: string) => {
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

export const Modal = ({ data, modals, index, initialParams }: Props) => {
   const Body = modals[data.name];
   const params = data.params ?? initialParams;
   const animate = params?.animate ?? initialParams?.animate;
   const blur = params?.blur ?? initialParams?.blur ?? true;
   const onClose = params?.onClose ?? initialParams?.onClose;
   const backdrop = params?.backdrop ?? initialParams?.backdrop;
   const body = params?.body ?? initialParams?.body;

   const position =
      params?.position ?? initialParams?.position ?? MODAL_POSITIONS.CENTER;

   const closeOnClickOutside =
      params?.closeOnClickOutside ?? initialParams?.closeOnClickOutside;
   const bodyAnimation = animate ? undefined : getModalBodyAnimation(position);

   const active = useModal((state) => state.active);
   const closeModal = useModal((state) => state.closeModal);

   return (
      <motion.div
         className='react-motion-modal__root'
         exit={animate?.exit ?? { opacity: 0 }}
         initial={animate?.exit ?? { opacity: 0 }}
         animate={animate?.animate ?? { opacity: 1 }}
         layout={true}
         style={{
            zIndex: Z_INDEX + index,
            backdropFilter: blur ? 'blur(8px)' : undefined,
            WebkitBackdropFilter: blur ? 'blur(8px)' : undefined,
         }}
      >
         <div
            className={clsx(
               'react-motion-modal__backdrop',
               {
                  'react-motion-modal__active': active?.id === data.id,
                  'react-motion-modal__backdrop--custom':
                     backdrop?.className,
               },
               backdrop?.className,
            )}
            style={{
               zIndex: Z_INDEX + index,
               ...backdrop?.style,
            }}
            onClick={() => {
               if (closeOnClickOutside) {
                  closeModal();

                  onClose?.();
               }
            }}
         />

         <div
            className={clsx(
               'react-motion-modal__body',
               getModalBodyPositionClassName(position),
               {
                  'react-motion-modal__body--active': active?.id === data.id,
               },
               body?.className,
            )}
            style={{
               zIndex: Z_INDEX + index + 1,
               ...body?.style,
            }}
            onClick={(e) => e.stopPropagation()}
         >
            <motion.div
               className='react-motion-modal__content'
               initial={bodyAnimation?.initial}
               animate={bodyAnimation?.animate}
               exit={bodyAnimation?.exit}
            >
               <Body {...(params as any)} />
            </motion.div>
         </div>
      </motion.div>
   );
};
