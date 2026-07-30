import { type FormEvent, useId, useState } from 'react';
import type { ModalRenderProps } from 'react-motion-modal';
import type { LabInput, LabResult } from './modal-lab.model';

export const LabModal = ({
   input,
   resolve,
   cancel,
}: ModalRenderProps<LabInput, LabResult>) => {
   const nameInputId = useId();
   const [name, setName] = useState('Sơn');

   if (input.scenario === 'form') {
      const submit = (event: FormEvent) => {
         event.preventDefault();
         resolve({ kind: 'form', name: name.trim() || 'Anonymous' });
      };

      return (
         <section className='modal-lab-surface'>
            <span className='modal-lab-surface__eyebrow'>Typed result</span>
            <h2>Edit profile</h2>
            <p>The form resolves a string without callback plumbing.</p>
            <form onSubmit={submit}>
               <label htmlFor={nameInputId}>Display name</label>
               <input
                  id={nameInputId}
                  name='displayName'
                  value={name}
                  autoComplete='name'
                  onChange={(event) => setName(event.currentTarget.value)}
               />
               <div className='modal-lab-surface__actions'>
                  <button
                     type='button'
                     className='modal-lab-button modal-lab-button--quiet'
                     onClick={() => cancel()}
                  >
                     Cancel
                  </button>
                  <button
                     type='submit'
                     className='modal-lab-button modal-lab-button--primary'
                  >
                     Save profile
                  </button>
               </div>
            </form>
         </section>
      );
   }

   if (input.scenario === 'nested') {
      return (
         <section className='modal-lab-surface'>
            <span className='modal-lab-surface__eyebrow'>
               Stack orchestration
            </span>
            <h2>Inspect release</h2>
            <p>
               Open another modal above this one, then return here with focus
               restored.
            </p>
            <dl className='modal-lab-summary'>
               <div>
                  <dt>Version</dt>
                  <dd>2.0.0</dd>
               </div>
               <div>
                  <dt>Checks</dt>
                  <dd>20 passed</dd>
               </div>
            </dl>
            <button
               type='button'
               className='modal-lab-button modal-lab-button--nested'
               onClick={() => void input.openNotice()}
            >
               Open nested notice
            </button>
            <div className='modal-lab-surface__actions'>
               <button
                  type='button'
                  className='modal-lab-button modal-lab-button--quiet'
                  onClick={() => cancel()}
               >
                  Cancel
               </button>
               <button
                  type='button'
                  className='modal-lab-button modal-lab-button--primary'
                  onClick={() => resolve({ kind: 'nested', inspected: true })}
               >
                  Finish inspection
               </button>
            </div>
         </section>
      );
   }

   return (
      <section className='modal-lab-surface'>
         <span className='modal-lab-surface__eyebrow'>Awaitable outcome</span>
         <h2>Publish this release?</h2>
         <p>
            The caller pauses until this modal resolves or reports why it was
            cancelled.
         </p>
         <div className='modal-lab-surface__actions'>
            <button
               type='button'
               className='modal-lab-button modal-lab-button--quiet'
               onClick={() => cancel()}
            >
               Not now
            </button>
            <button
               type='button'
               className='modal-lab-button modal-lab-button--primary'
               onClick={() => resolve({ kind: 'confirm', confirmed: true })}
            >
               Publish
            </button>
         </div>
      </section>
   );
};

export const NoticeModal = ({
   input,
   resolve,
}: ModalRenderProps<{ message: string }, void>) => (
   <section className='modal-lab-surface modal-lab-surface--notice'>
      <span className='modal-lab-surface__eyebrow'>Nested modal</span>
      <h2>Stack is active</h2>
      <p>{input.message}</p>
      <div className='modal-lab-surface__actions'>
         <button
            type='button'
            className='modal-lab-button modal-lab-button--primary'
            onClick={() => resolve()}
         >
            Return to parent
         </button>
      </div>
   </section>
);
