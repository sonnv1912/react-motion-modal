import type { ModalPolicy, ModalPosition } from 'react-motion-modal';
import {
   type LabPreset,
   type LabScenario,
   POLICY_OPTIONS,
   POSITION_OPTIONS,
   PRESET_OPTIONS,
   SCENARIO_OPTIONS,
} from './modal-lab.model';

type LabControlsProps = {
   scenario: LabScenario;
   preset: LabPreset;
   policy: ModalPolicy;
   position: ModalPosition;
   blur: boolean;
   closeOnEscape: boolean;
   closeOnBackdrop: boolean;
   onScenarioChange: (scenario: LabScenario) => void;
   onPresetChange: (preset: LabPreset) => void;
   onPolicyChange: (policy: ModalPolicy) => void;
   onPositionChange: (position: ModalPosition) => void;
   onBlurChange: (enabled: boolean) => void;
   onCloseOnEscapeChange: (enabled: boolean) => void;
   onCloseOnBackdropChange: (enabled: boolean) => void;
};

export const LabControls = ({
   scenario,
   preset,
   policy,
   position,
   blur,
   closeOnEscape,
   closeOnBackdrop,
   onScenarioChange,
   onPresetChange,
   onPolicyChange,
   onPositionChange,
   onBlurChange,
   onCloseOnEscapeChange,
   onCloseOnBackdropChange,
}: LabControlsProps) => (
   <aside className='modal-lab-controls' aria-label='Modal configuration'>
      <fieldset className='modal-lab-fieldset'>
         <legend>Scenario</legend>
         <div className='modal-lab-scenarios'>
            {SCENARIO_OPTIONS.map((option) => (
               <button
                  key={option.value}
                  type='button'
                  className='modal-lab-scenario'
                  data-active={scenario === option.value}
                  aria-pressed={scenario === option.value}
                  onClick={() => onScenarioChange(option.value)}
               >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
               </button>
            ))}
         </div>
      </fieldset>

      <div className='modal-lab-control-grid'>
         <fieldset className='modal-lab-fieldset'>
            <legend>Motion preset</legend>
            <div className='modal-lab-segmented'>
               {PRESET_OPTIONS.map((option) => (
                  <button
                     key={option.value}
                     type='button'
                     data-active={preset === option.value}
                     aria-pressed={preset === option.value}
                     onClick={() => onPresetChange(option.value)}
                  >
                     {option.label}
                  </button>
               ))}
            </div>
         </fieldset>

         <fieldset className='modal-lab-fieldset'>
            <legend>Policy</legend>
            <div className='modal-lab-segmented'>
               {POLICY_OPTIONS.map((option) => (
                  <button
                     key={option.value}
                     type='button'
                     data-active={policy === option.value}
                     aria-pressed={policy === option.value}
                     onClick={() => onPolicyChange(option.value)}
                  >
                     {option.label}
                  </button>
               ))}
            </div>
         </fieldset>
      </div>

      <fieldset className='modal-lab-fieldset'>
         <legend>Position</legend>
         <div className='modal-lab-position-grid'>
            {POSITION_OPTIONS.map((option) => (
               <button
                  key={option.value}
                  type='button'
                  title={option.label}
                  aria-label={option.label}
                  data-active={position === option.value}
                  aria-pressed={position === option.value}
                  onClick={() => onPositionChange(option.value)}
               >
                  <span aria-hidden='true'>{option.symbol}</span>
               </button>
            ))}
         </div>
      </fieldset>

      <fieldset className='modal-lab-fieldset'>
         <legend>Behavior</legend>
         <div className='modal-lab-toggles'>
            <label>
               <input
                  type='checkbox'
                  checked={blur}
                  onChange={(event) =>
                     onBlurChange(event.currentTarget.checked)
                  }
               />
               <span>Blur backdrop</span>
            </label>
            <label>
               <input
                  type='checkbox'
                  checked={closeOnEscape}
                  onChange={(event) =>
                     onCloseOnEscapeChange(event.currentTarget.checked)
                  }
               />
               <span>Escape closes</span>
            </label>
            <label>
               <input
                  type='checkbox'
                  checked={closeOnBackdrop}
                  onChange={(event) =>
                     onCloseOnBackdropChange(event.currentTarget.checked)
                  }
               />
               <span>Backdrop closes</span>
            </label>
         </div>
      </fieldset>
   </aside>
);
