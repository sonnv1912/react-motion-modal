import {
   type FormEvent,
   type ReactNode,
   useEffect,
   useId,
   useState,
} from 'react';
import {
   createModalSystem,
   defineModal,
   type ModalOpenOptions,
   ModalProvider,
   type ModalRenderProps,
   motionPresets,
} from 'react-motion-modal';

type MessageInput = {
   message: string;
};

type ConfirmInput = {
   title: string;
};

type FormInput = {
   defaultValue: string;
};

const Card = ({ children }: { children: ReactNode }) => (
   <div
      style={{
         background: '#fff',
         borderRadius: 12,
         padding: 20,
         width: 'min(360px, calc(100vw - 32px))',
         boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
      }}
   >
      {children}
   </div>
);

const MessageModal = ({
   input,
   resolve,
}: ModalRenderProps<MessageInput, void>) => (
   <Card>
      <p style={{ marginTop: 0 }}>{input.message}</p>
      <button type='button' onClick={() => resolve()}>
         OK
      </button>
   </Card>
);

const ConfirmModal = ({
   input,
   resolve,
   cancel,
}: ModalRenderProps<ConfirmInput, boolean>) => (
   <Card>
      <h3 style={{ marginTop: 0 }}>{input.title}</h3>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
         <button type='button' onClick={() => cancel()}>
            Cancel
         </button>
         <button type='button' onClick={() => resolve(true)}>
            Confirm
         </button>
      </div>
   </Card>
);

const FormModal = ({
   input,
   resolve,
   cancel,
}: ModalRenderProps<FormInput, string>) => {
   const inputId = useId();
   const [value, setValue] = useState(input.defaultValue);

   const submit = (event: FormEvent) => {
      event.preventDefault();
      resolve(value);
   };

   return (
      <Card>
         <form onSubmit={submit}>
            <label
               htmlFor={inputId}
               style={{ display: 'block', marginBottom: 12 }}
            >
               Name
               <input
                  id={inputId}
                  name='name'
                  autoComplete='name'
                  value={value}
                  onChange={(event) => setValue(event.currentTarget.value)}
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
                     modalSystem.open('alert', {
                        message: 'This alert is stacked above the form.',
                     })
                  }
               >
                  Open nested alert
               </button>
               <button type='button' onClick={() => cancel()}>
                  Cancel
               </button>
               <button type='submit'>Save</button>
            </div>
         </form>
      </Card>
   );
};

const modalSystem = createModalSystem({
   alert: defineModal({
      component: MessageModal,
      preset: motionPresets.dialog(),
   }),
   confirm: defineModal({
      component: ConfirmModal,
      preset: motionPresets.dialog(),
      policy: 'singleton',
   }),
   form: defineModal({
      component: FormModal,
      preset: motionPresets.drawer(),
   }),
   sheet: defineModal({
      component: MessageModal,
      preset: motionPresets.sheet(),
   }),
   replacement: defineModal({
      component: MessageModal,
      preset: motionPresets.dialog(),
      policy: 'replace',
   }),
});

const defaultOptions: ModalOpenOptions = {
   ariaLabel: 'Example modal',
   backdrop: {
      style: {
         backgroundColor: 'rgba(15, 23, 42, 0.38)',
      },
   },
   body: {
      style: {
         padding: 16,
      },
   },
};

export const App = () => {
   const [log, setLog] = useState<string[]>([]);
   const [historyStep, setHistoryStep] = useState(() =>
      Number(new URLSearchParams(window.location.search).get('history-step')),
   );

   useEffect(() => {
      const syncHistoryStep = () => {
         setHistoryStep(
            Number(
               new URLSearchParams(window.location.search).get('history-step'),
            ),
         );
      };

      window.addEventListener('popstate', syncHistoryStep);
      return () => window.removeEventListener('popstate', syncHistoryStep);
   }, []);

   const push = (message: string) =>
      setLog((items) => [message, ...items].slice(0, 8));

   const openConfirmation = async () => {
      const outcome = await modalSystem.open('confirm', {
         title: 'Delete this item?',
      });

      if (outcome.status === 'resolved' && outcome.value) {
         push('confirmation resolved with true');
         return;
      }

      if (outcome.status === 'cancelled') {
         push(`confirmation cancelled: ${outcome.reason}`);
      }
   };

   const openForm = async () => {
      const outcome = await modalSystem.open('form', {
         defaultValue: 'Sơn',
      });

      if (outcome.status === 'resolved') {
         push(`form resolved: ${outcome.value}`);
      } else {
         push(`form cancelled: ${outcome.reason}`);
      }
   };

   const createHistoryEntry = () => {
      const nextStep = historyStep + 1;
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('history-step', String(nextStep));
      window.history.pushState(null, '', nextUrl);
      setHistoryStep(nextStep);
   };

   return (
      <>
         <ModalProvider system={modalSystem} defaultOptions={defaultOptions} />

         <main>
            <h1>react-motion-modal — typed flows</h1>

            <section>
               <h2>Awaitable results</h2>
               <button type='button' onClick={() => void openConfirmation()}>
                  Open typed confirmation
               </button>
               <button type='button' onClick={() => void openForm()}>
                  Open typed form
               </button>
            </section>

            <section>
               <h2>Motion presets</h2>
               <button
                  type='button'
                  onClick={() =>
                     modalSystem.open('alert', {
                        message: 'Dialog preset',
                     })
                  }
               >
                  Dialog
               </button>
               <button
                  type='button'
                  onClick={() =>
                     modalSystem.open('form', { defaultValue: 'Drawer' })
                  }
               >
                  Drawer
               </button>
               <button
                  type='button'
                  onClick={() =>
                     modalSystem.open('sheet', {
                        message: 'Sheet preset',
                     })
                  }
               >
                  Sheet
               </button>
            </section>

            <section>
               <h2>Orchestration</h2>
               <button
                  type='button'
                  onClick={() => {
                     void modalSystem.open('alert', {
                        message: 'First modal in the stack',
                     });
                     void modalSystem.open('alert', {
                        message: 'Second modal in the stack',
                     });
                  }}
               >
                  Stack two dialogs
               </button>
               <button
                  type='button'
                  onClick={() => {
                     void modalSystem.open('alert', {
                        message: 'This modal will be replaced immediately.',
                     });
                     void modalSystem.open('replacement', {
                        message: 'The previous active modal was replaced.',
                     });
                  }}
               >
                  Replace active modal
               </button>
            </section>

            <section>
               <h2>Browser Back / Forward</h2>
               <p>
                  History step: <strong>{historyStep}</strong>. Create an entry,
                  open the test modal, then press the browser Back or Forward
                  button.
               </p>
               <button type='button' onClick={createHistoryEntry}>
                  Create history entry
               </button>
               <button
                  type='button'
                  onClick={() =>
                     void modalSystem.open('alert', {
                        message:
                           'Press the browser Back or Forward button. This modal should close automatically.',
                     })
                  }
               >
                  Open history test modal
               </button>
            </section>

            <section>
               <h2>Outcome log</h2>
               {log.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>
                     Complete or cancel an awaitable flow.
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
