import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ModalProvider } from '../providers/modal-provider';
import { App } from './app';
import { AlertModal } from './modal/alert-modal';
import { ConfirmModal } from './modal/confirm-modal';

declare module '../hooks/store/use-modal' {
   interface ModalStackParams {
      AlertModal: {
         title: string;
      };
      ConfirmModal: {
         onConfirm: () => void;
      };
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
