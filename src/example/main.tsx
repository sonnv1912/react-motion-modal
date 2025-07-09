import { StrictMode, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { ModalProvider } from '../providers/modal-provider';
import { AlertModal } from './modal/alert-modal';
import { ConfirmModal } from './modal/confirm-modal';

declare module '../hooks/store/use-modal' {
   interface ModalStackParams {
      AlertModal: (props: { title: string }) => ReactElement;
      ConfirmModal: (props: { onConfirm: () => void }) => ReactElement;
   }
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <App />

      <ModalProvider
         modals={{
            AlertModal,
            ConfirmModal,
         }}
      />
   </StrictMode>,
);
