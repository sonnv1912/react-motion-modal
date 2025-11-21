import clsx from 'clsx';
import type { ModalParams } from '#types/modal.type';

export const AlertModal = ({ closeModal }: ModalParams<'AlertModal'>) => {
   const className =
      'bg-blue-400 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600';

   return (
      <div className='bg-white p-4 rounded-xl'>
         <p className='text-xl font-semibold mb-4 text-red-500'>Alert !</p>

         <p className='break-all'>
            Autem sed ut veniam et. Et maxime sed culpa molestiae. Nisi et rerum
            incidunt unde ea iure. Reiciendis odio unde inventore quia ullam
         </p>

         <div className='flex items-center justify-end gap-2 mt-4 '>
            <div className={clsx(className)} onClick={() => closeModal()}>
               <p>Close</p>
            </div>
         </div>
      </div>
   );
};
