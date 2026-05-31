import { MODAL_POSITIONS } from '@configs/constant';
import { useModal } from '@hooks/store/use-modal';

const POSITIONS = [
   ['Top', MODAL_POSITIONS.TOP],
   ['Top left', MODAL_POSITIONS.TOP_LEFT],
   ['Top right', MODAL_POSITIONS.TOP_RIGHT],
   ['Top center', MODAL_POSITIONS.TOP_CENTER],
   ['Left', MODAL_POSITIONS.LEFT],
   ['Right', MODAL_POSITIONS.RIGHT],
   ['Center', MODAL_POSITIONS.CENTER],
   ['Center full', MODAL_POSITIONS.CENTER_FULL],
   ['Bottom', MODAL_POSITIONS.BOTTOM],
   ['Bottom left', MODAL_POSITIONS.BOTTOM_LEFT],
   ['Bottom right', MODAL_POSITIONS.BOTTOM_RIGHT],
   ['Bottom center', MODAL_POSITIONS.BOTTOM_CENTER],
] as const;

export const App = () => {
   const openModal = useModal((state) => state.openModal);

   return (
      <div className='example-page'>
         <div className='example-header'>
            <p>This is header</p>
         </div>

         <div className='example-container'>
            <h1 className='example-title'>Modal positions</h1>

            <div className='example-grid'>
               {POSITIONS.map(([label, position]) => (
                  <button
                     key={position}
                     type='button'
                     onClick={() =>
                        openModal('AlertModal', {
                           position,
                           closeOnClickOutside: true,
                           body: {
                              className: 'example-modal-width',
                           },
                        })
                     }
                     className='example-button'
                  >
                     {label}
                  </button>
               ))}
            </div>
         </div>
      </div>
   );
};
