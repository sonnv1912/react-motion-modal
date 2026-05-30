import { MODAL_POSITIONS } from '@configs/constant';
import { useModal } from '@hooks/store/use-modal';

const POSITIONS = [
   ['Top left', MODAL_POSITIONS.TOP_LEFT],
   ['Top center', MODAL_POSITIONS.TOP_CENTER],
   ['Top right', MODAL_POSITIONS.TOP_RIGHT],
   ['Center left', MODAL_POSITIONS.CENTER_LEFT],
   ['Center', MODAL_POSITIONS.CENTER],
   ['Center right', MODAL_POSITIONS.CENTER_RIGHT],
   ['Bottom left', MODAL_POSITIONS.BOTTOM_LEFT],
   ['Bottom center', MODAL_POSITIONS.BOTTOM_CENTER],
   ['Bottom right', MODAL_POSITIONS.BOTTOM_RIGHT],
] as const;

export const App = () => {
   const openModal = useModal((state) => state.openModal);

   return (
      <div className='min-h-screen bg-slate-100 px-6 py-28'>
         <div className='fixed bg-black text-white text-center py-10 z-50 left-0 right-0 top-0'>
            <p>This is header</p>
         </div>

         <div className='mx-auto max-w-3xl'>
            <h1 className='text-2xl font-semibold text-slate-900'>
               Modal positions
            </h1>

            <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
               {POSITIONS.map(([label, position]) => (
                  <button
                     key={position}
                     type='button'
                     onClick={() =>
                        openModal('AlertModal', {
                           position,
                           closeOnClickOutside: true,
                           body: {
                              className: 'w-full sm:w-96',
                           },
                        })
                     }
                     className='rounded-md bg-blue-500 px-4 py-3 text-white transition hover:bg-blue-600'
                  >
                     {label}
                  </button>
               ))}
            </div>
         </div>
      </div>
   );
};
