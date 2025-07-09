import { useModal } from '../../../hooks/store/use-modal';

export const OpenModalButton = () => {
   const openModal = useModal((state) => state.openModal);

   return (
      <div
         onClick={() => openModal('AlertModal')}
         className='bg-white px-4 py-2 rounded-md cursor-pointer hover:opacity-80'
      >
         Click to show alert
      </div>
   );
};
