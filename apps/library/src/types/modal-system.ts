import type { TargetAndTransition } from 'motion';
import type { ComponentType, CSSProperties } from 'react';
import type { ModalPosition } from '../configs/constant';

export type ModalCancelReason =
   | 'escape'
   | 'backdrop'
   | 'programmatic'
   | 'replaced'
   | 'provider-unmounted';

export type ModalOutcome<Result> =
   | { status: 'resolved'; value: Result }
   | { status: 'cancelled'; reason: ModalCancelReason };

export type ModalPolicy = 'stack' | 'replace' | 'singleton';

export type ModalMotionState = {
   initial?: TargetAndTransition;
   animate?: TargetAndTransition;
   exit?: TargetAndTransition;
};

export type ModalMotion = {
   backdrop?: ModalMotionState;
   content: ModalMotionState;
};

export type ModalMotionPreset = {
   position: ModalPosition;
   motion: ModalMotion;
};

export type ModalSlotOptions = {
   className?: string;
   style?: CSSProperties;
};

export type ModalOpenOptions = {
   ariaLabel?: string;
   ariaLabelledBy?: string;
   ariaDescribedBy?: string;
   closeOnClickOutside?: boolean;
   closeOnPressEsc?: boolean;
   position?: ModalPosition;
   backdrop?: ModalSlotOptions;
   body?: ModalSlotOptions;
   blur?: boolean;
   motion?: ModalMotion;
};

export type ModalRenderProps<Input, Result> = {
   input: Input;
   resolve: (value: Result) => void;
   cancel: (reason?: 'programmatic') => void;
};

export type ModalDefinition<Input, Result> = {
   component: ComponentType<ModalRenderProps<Input, Result>>;
   policy?: ModalPolicy;
   preset?: ModalMotionPreset;
   defaultOptions?: ModalOpenOptions;
};

export type AnyModalDefinition = ModalDefinition<any, any>;
export type ModalRegistry = Record<string, AnyModalDefinition>;

export type ModalInput<Definition> = Definition extends ModalDefinition<
   infer Input,
   any
>
   ? Input
   : never;

export type ModalResult<Definition> = Definition extends ModalDefinition<
   any,
   infer Result
>
   ? Result
   : never;

// biome-ignore lint/suspicious/noConfusingVoidType: void identifies definitions that do not require input.
type OpenArgs<Input> = [Input] extends [void]
   ? [input?: Input, options?: ModalOpenOptions]
   : [input: Input, options?: ModalOpenOptions];

export type ModalSystem<Registry extends ModalRegistry> = {
   open<Name extends keyof Registry & string>(
      name: Name,
      ...args: OpenArgs<ModalInput<Registry[Name]>>
   ): Promise<ModalOutcome<ModalResult<Registry[Name]>>>;
   cancel(reason?: ModalCancelReason): void;
   cancelAll(reason?: ModalCancelReason): void;
};
