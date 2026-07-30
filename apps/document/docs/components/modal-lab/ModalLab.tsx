import { useCallback, useId, useRef, useState } from 'react';
import {
   createModalSystem,
   defineModal,
   type ModalOpenOptions,
   type ModalOutcome,
   type ModalPolicy,
   type ModalPosition,
   ModalProvider,
   motionPresets,
} from 'react-motion-modal';
import { LabControls } from './LabControls';
import { LabModal, NoticeModal } from './LabModal';
import {
   appendLabEvent,
   formatLabOutcome,
   getRecommendedPosition,
   type LabEvent,
   type LabInput,
   type LabPreset,
   type LabResult,
   type LabScenario,
   type LabViewport,
} from './modal-lab.model';
import './modal-lab.css';

const modalLabSystem = createModalSystem({
   labStack: defineModal<LabInput, LabResult>({
      component: LabModal,
      policy: 'stack',
   }),
   labReplace: defineModal<LabInput, LabResult>({
      component: LabModal,
      policy: 'replace',
   }),
   labSingleton: defineModal<LabInput, LabResult>({
      component: LabModal,
      policy: 'singleton',
   }),
   notice: defineModal({
      component: NoticeModal,
      policy: 'stack',
      preset: motionPresets.dialog(),
   }),
});

const getMotionPreset = (preset: LabPreset, position: ModalPosition) => {
   if (preset === 'drawer') {
      return motionPresets.drawer({
         side: position.includes('left') ? 'left' : 'right',
      });
   }

   if (preset === 'sheet') {
      return motionPresets.sheet({
         edge: position.startsWith('top') ? 'top' : 'bottom',
      });
   }

   return motionPresets.dialog();
};

export const ModalLab = () => {
   const [scenario, setScenario] = useState<LabScenario>('confirm');
   const [preset, setPreset] = useState<LabPreset>('dialog');
   const [policy, setPolicy] = useState<ModalPolicy>('stack');
   const [position, setPosition] = useState<ModalPosition>('center');
   const [viewport, setViewport] = useState<LabViewport>('desktop');
   const [blur, setBlur] = useState(true);
   const [closeOnEscape, setCloseOnEscape] = useState(true);
   const [closeOnBackdrop, setCloseOnBackdrop] = useState(true);
   const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null);
   const [events, setEvents] = useState<LabEvent[]>([
      { id: 0, message: 'Lab ready · choose a scenario' },
   ]);
   const nextEventId = useRef(1);
   const titleId = useId();

   const pushEvent = useCallback((message: string) => {
      const id = nextEventId.current++;
      setEvents((current) => appendLabEvent(current, message, id));
   }, []);

   const createOpenOptions = useCallback(
      (activePreset: LabPreset, activePosition: ModalPosition) => {
         const motionPreset = getMotionPreset(activePreset, activePosition);

         return {
            ariaLabel: `${scenario} playground modal`,
            position: activePosition,
            motion: motionPreset.motion,
            blur,
            closeOnPressEsc: closeOnEscape,
            closeOnClickOutside: closeOnBackdrop,
            backdrop: {
               style: { backgroundColor: 'rgb(8 10 22 / 62%)' },
            },
            body: {
               className: `modal-lab-body modal-lab-body--${activePreset}`,
            },
         } satisfies ModalOpenOptions;
      },
      [blur, closeOnBackdrop, closeOnEscape, scenario],
   );

   const openNotice = useCallback(async () => {
      pushEvent('nested notice requested · stack');
      const outcome = await modalLabSystem.open('notice', {
         message: 'The parent remains mounted underneath this dialog.',
      });
      pushEvent(
         outcome.status === 'resolved'
            ? 'nested notice resolved'
            : `nested notice cancelled · ${outcome.reason}`,
      );
   }, [pushEvent]);

   const launch = async () => {
      pushEvent(`${scenario} requested · ${policy}/${preset}/${position}`);
      const input: LabInput = {
         scenario,
         onEvent: pushEvent,
         openNotice,
      };
      const options = createOpenOptions(preset, position);
      let outcome: ModalOutcome<LabResult>;

      if (policy === 'replace') {
         outcome = await modalLabSystem.open('labReplace', input, options);
      } else if (policy === 'singleton') {
         outcome = await modalLabSystem.open('labSingleton', input, options);
      } else {
         outcome = await modalLabSystem.open('labStack', input, options);
      }

      pushEvent(formatLabOutcome(scenario, outcome));
   };

   const selectPreset = (nextPreset: LabPreset) => {
      setPreset(nextPreset);
      setPosition(getRecommendedPosition(nextPreset));
   };

   const cancelAll = () => {
      modalLabSystem.cancelAll();
      pushEvent('cancel all requested');
   };

   return (
      <section className='modal-lab' aria-labelledby={titleId}>
         <header className='modal-lab-header'>
            <div>
               <span className='modal-lab-kicker'>
                  Interactive configurator
               </span>
               <h2 id={titleId}>Modal Lab</h2>
               <p>
                  Combine contracts, motion, placement, and orchestration
                  without editing code first.
               </p>
            </div>
            <output className='modal-lab-status' aria-label='Runtime status'>
               <span />
               Source-linked
            </output>
         </header>

         <div className='modal-lab-workspace'>
            <LabControls
               scenario={scenario}
               preset={preset}
               policy={policy}
               position={position}
               blur={blur}
               closeOnEscape={closeOnEscape}
               closeOnBackdrop={closeOnBackdrop}
               onScenarioChange={setScenario}
               onPresetChange={selectPreset}
               onPolicyChange={setPolicy}
               onPositionChange={setPosition}
               onBlurChange={setBlur}
               onCloseOnEscapeChange={setCloseOnEscape}
               onCloseOnBackdropChange={setCloseOnBackdrop}
            />

            <div className='modal-lab-output'>
               <div className='modal-lab-toolbar'>
                  <div className='modal-lab-toolbar__label'>
                     <span className='modal-lab-toolbar__dot' />
                     Live preview
                  </div>
                  <fieldset
                     className='modal-lab-viewport-switch'
                     aria-label='Preview viewport'
                  >
                     <button
                        type='button'
                        aria-pressed={viewport === 'desktop'}
                        data-active={viewport === 'desktop'}
                        onClick={() => setViewport('desktop')}
                     >
                        Desktop
                     </button>
                     <button
                        type='button'
                        aria-pressed={viewport === 'mobile'}
                        data-active={viewport === 'mobile'}
                        onClick={() => setViewport('mobile')}
                     >
                        Mobile
                     </button>
                  </fieldset>
               </div>

               <div className='modal-lab-preview-shell'>
                  <div className='modal-lab-preview' data-viewport={viewport}>
                     <div className='modal-lab-demo-app'>
                        <span>Workspace / Releases</span>
                        <h3>Motion flow preview</h3>
                        <p>Launch repeatedly to observe the selected policy.</p>
                        <button
                           type='button'
                           className='modal-lab-button modal-lab-button--primary'
                           onClick={() => void launch()}
                        >
                           Launch {scenario}
                        </button>
                     </div>
                     <div className='modal-lab-portal' ref={setPortalRoot} />
                  </div>
               </div>

               <div className='modal-lab-runtime'>
                  <div className='modal-lab-runtime__header'>
                     <strong>Event log</strong>
                     <button type='button' onClick={cancelAll}>
                        Cancel all
                     </button>
                  </div>
                  <ol aria-live='polite'>
                     {events.map((event) => (
                        <li key={event.id}>{event.message}</li>
                     ))}
                  </ol>
               </div>
            </div>
         </div>

         <ModalProvider system={modalLabSystem} portalRoot={portalRoot} />
      </section>
   );
};
