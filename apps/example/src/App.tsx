import { type ReactNode, useState } from 'react';
import {
   MODAL_POSITIONS,
   type ModalParams,
   ModalProvider,
   modalStore,
} from 'react-motion-modal';

// 1. Declare your modal names + params (type-safe via module augmentation).
declare module 'react-motion-modal' {
   interface ModalDefinition {
      alert: { message: string };
      confirm: { title: string; onConfirm: () => void };
      form: { defaultValue: string };
   }
}

const Card = ({ children }: { children: ReactNode }) => (
   <div
      style={{
         background: '#fff',
         borderRadius: 12,
         padding: 20,
         maxWidth: 360,
         boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
      }}
   >
      {children}
   </div>
);

const AlertModal = ({ message, closeModal }: ModalParams<'alert'>) => (
   <Card>
      <p style={{ marginTop: 0 }}>{message}</p>
      <button type='button' onClick={closeModal}>
         OK
      </button>
   </Card>
);

const ConfirmModal = ({
   title,
   onConfirm,
   closeModal,
}: ModalParams<'confirm'>) => (
   <Card>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
         <button type='button' onClick={closeModal}>
            Cancel
         </button>
         <button
            type='button'
            onClick={() => {
               onConfirm();
               closeModal();
            }}
         >
            Confirm
         </button>
      </div>
   </Card>
);

const FormModal = ({ defaultValue, closeModal }: ModalParams<'form'>) => {
   const { openModal } = modalStore();

   return (
      <Card>
         <label style={{ display: 'block', marginBottom: 12 }}>
            Name
            <input
               defaultValue={defaultValue}
               style={{
                  display: 'block',
                  marginTop: 4,
                  padding: 6,
                  borderRadius: 6,
                  border: '1px solid #c7cdd6',
               }}
            />
         </label>
         <div style={{ display: 'flex', gap: 8 }}>
            <button
               type='button'
               onClick={() =>
                  openModal('alert', {
                     message:
                        'Opened from inside another modal — stacking + focus trap.',
                  })
               }
            >
               Open nested alert
            </button>
            <button type='button' onClick={closeModal}>
               Close
            </button>
         </div>
      </Card>
   );
};

const POSITIONS: ReadonlyArray<readonly [string, string]> = [
   ['Center', MODAL_POSITIONS.CENTER],
   ['Right', MODAL_POSITIONS.RIGHT],
   ['Left', MODAL_POSITIONS.LEFT],
   ['Top', MODAL_POSITIONS.TOP],
   ['Bottom', MODAL_POSITIONS.BOTTOM],
   ['Top-Right', MODAL_POSITIONS.TOP_RIGHT],
];

export const App = () => {
   const { openModal } = modalStore();
   const [log, setLog] = useState<string[]>([]);

   const push = (message: string) =>
      setLog((items) => [message, ...items].slice(0, 8));

   return (
      <>
         <ModalProvider
            modals={{
               alert: AlertModal,
               confirm: ConfirmModal,
               form: FormModal,
            }}
         />

         <main>
            <h1>react-motion-modal — example</h1>

            <section>
               <h2>Basic</h2>
               <button
                  type='button'
                  onClick={() =>
                     openModal('alert', {
                        message: 'Hello from the alert modal!',
                        onClose: () =>
                           push('alert closed (onClose fired once)'),
                     })
                  }
               >
                  Open alert
               </button>
               <button
                  type='button'
                  onClick={() =>
                     openModal('confirm', {
                        title: 'Delete this item?',
                        onConfirm: () => push('confirmed'),
                        onClose: () => push('confirm closed'),
                     })
                  }
               >
                  Open confirm
               </button>
               <button
                  type='button'
                  onClick={() => openModal('form', { defaultValue: 'Sơn' })}
               >
                  Open form (focus trap)
               </button>
            </section>

            <section>
               <h2>Positions</h2>
               {POSITIONS.map(([label, position]) => (
                  <button
                     type='button'
                     key={position}
                     onClick={() =>
                        openModal('alert', {
                           message: `Position: ${position}`,
                           position,
                        })
                     }
                  >
                     {label}
                  </button>
               ))}
            </section>

            <section>
               <h2>Behavior toggles</h2>
               <button
                  type='button'
                  onClick={() =>
                     openModal('alert', {
                        message: 'Clicking outside will NOT close this modal.',
                        closeOnClickOutside: false,
                     })
                  }
               >
                  closeOnClickOutside = false
               </button>
               <button
                  type='button'
                  onClick={() =>
                     openModal('alert', {
                        message: 'Pressing ESC will NOT close this modal.',
                        closeOnPressEsc: false,
                     })
                  }
               >
                  closeOnPressEsc = false
               </button>
               <button
                  type='button'
                  onClick={() =>
                     openModal('alert', {
                        message: 'No backdrop blur.',
                        blur: false,
                     })
                  }
               >
                  blur = false
               </button>
            </section>

            <section>
               <h2>onClose log</h2>
               {log.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>
                     Nothing yet — open and close a modal.
                  </p>
               ) : (
                  <ul>
                     {log.map((item) => (
                        <li key={item}>{item}</li>
                     ))}
                  </ul>
               )}
            </section>
         </main>
      </>
   );
};
