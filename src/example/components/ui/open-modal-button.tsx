import { useModal } from '../../../hooks/store/use-modal';

export const OpenModalButton = () => {
   const openModal = useModal((state) => state.openModal);

   return (
      <div
         onClick={() => openModal('AlertModal')}
         className='bg-white px-4 py-2 rounded-md cursor-pointer hover:opacity-80 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
      >
         Click to show alert
      </div>
   );
};
