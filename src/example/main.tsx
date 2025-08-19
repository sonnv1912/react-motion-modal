import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ModalProvider } from '..';
import { App } from './app';
import { AlertModal } from './modal/alert-modal';
import { ConfirmModal } from './modal/confirm-modal';

declare module '../hooks/store/use-modal' {
   interface ModalDefinition {
      AlertModal: {
         title: string;
      };
      ConfirmModal: {
         onConfirm: () => void;
      };
   }
}

// biome-ignore lint/style/noNonNullAssertion: false
createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <App />

      <ModalProvider
         initialParams={{
            closeOnPressEsc: true,
         }}
         modals={{
            AlertModal,
            ConfirmModal,
         }}
      />
   </StrictMode>,
);
