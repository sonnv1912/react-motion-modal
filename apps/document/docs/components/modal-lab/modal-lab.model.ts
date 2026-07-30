import type {
   ModalOutcome,
   ModalPolicy,
   ModalPosition,
} from 'react-motion-modal';

export type LabScenario = 'confirm' | 'form' | 'nested';
export type LabPreset = 'dialog' | 'drawer' | 'sheet';
export type LabViewport = 'desktop' | 'mobile';

export type LabResult =
   | { kind: 'confirm'; confirmed: boolean }
   | { kind: 'form'; name: string }
   | { kind: 'nested'; inspected: boolean };

export type LabInput = {
   scenario: LabScenario;
   onEvent: (message: string) => void;
   openNotice: () => Promise<void>;
};

export type LabEvent = {
   id: number;
   message: string;
};

export const SCENARIO_OPTIONS = [
   {
      value: 'confirm',
      label: 'Confirm',
      description: 'Await a boolean decision',
   },
   {
      value: 'form',
      label: 'Typed form',
      description: 'Resolve a string result',
   },
   {
      value: 'nested',
      label: 'Nested stack',
      description: 'Open a modal from a modal',
   },
] as const satisfies ReadonlyArray<{
   value: LabScenario;
   label: string;
   description: string;
}>;

export const PRESET_OPTIONS = [
   { value: 'dialog', label: 'Dialog' },
   { value: 'drawer', label: 'Drawer' },
   { value: 'sheet', label: 'Sheet' },
] as const satisfies ReadonlyArray<{
   value: LabPreset;
   label: string;
}>;

export const POLICY_OPTIONS = [
   { value: 'stack', label: 'Stack' },
   { value: 'replace', label: 'Replace' },
   { value: 'singleton', label: 'Singleton' },
] as const satisfies ReadonlyArray<{
   value: ModalPolicy;
   label: string;
}>;

export const POSITION_OPTIONS = [
   { value: 'top-left', label: 'Top left', symbol: '↖' },
   { value: 'top-center', label: 'Top center', symbol: '↑' },
   { value: 'top-right', label: 'Top right', symbol: '↗' },
   { value: 'left', label: 'Left', symbol: '←' },
   { value: 'center', label: 'Center', symbol: '•' },
   { value: 'right', label: 'Right', symbol: '→' },
   { value: 'bottom-left', label: 'Bottom left', symbol: '↙' },
   { value: 'bottom-center', label: 'Bottom center', symbol: '↓' },
   { value: 'bottom-right', label: 'Bottom right', symbol: '↘' },
] as const satisfies ReadonlyArray<{
   value: ModalPosition;
   label: string;
   symbol: string;
}>;

export const getRecommendedPosition = (preset: LabPreset): ModalPosition => {
   switch (preset) {
      case 'drawer':
         return 'right';
      case 'sheet':
         return 'bottom';
      default:
         return 'center';
   }
};

export const appendLabEvent = (
   events: LabEvent[],
   message: string,
   id: number,
): LabEvent[] => [{ id, message }, ...events].slice(0, 8);

export const formatLabOutcome = (
   scenario: LabScenario,
   outcome: ModalOutcome<LabResult>,
): string => {
   if (outcome.status === 'cancelled') {
      return `${scenario} cancelled · ${outcome.reason}`;
   }

   switch (outcome.value.kind) {
      case 'confirm':
         return `confirm resolved · ${
            outcome.value.confirmed ? 'confirmed' : 'declined'
         }`;
      case 'form':
         return `form resolved · ${outcome.value.name}`;
      case 'nested':
         return `nested resolved · ${
            outcome.value.inspected ? 'inspected' : 'skipped'
         }`;
   }
};
