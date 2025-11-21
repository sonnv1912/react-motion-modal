import { useModal } from '@hooks/store/use-modal';

export const App = () => {
   const openModal = useModal((state) => state.openModal);

   return (
      <div>
         <div className='fixed bg-black text-white text-center py-10 z-50 left-0 right-0 top-0'>
            <p>This is header</p>
         </div>

         <div
            onClick={() => openModal('AlertModal')}
            className='text-white px-4 py-2 rounded-md cursor-pointer bg-blue-500 hover:opacity-80 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
         >
            Click to show alert
         </div>
      </div>
   );
};
