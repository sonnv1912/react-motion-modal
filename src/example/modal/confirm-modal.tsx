import clsx from 'clsx';
import type { ModalParams } from '#types/modal.type';

export const ConfirmModal = ({ closeModal }: ModalParams<'ConfirmModal'>) => {
   const className = 'text-white px-4 py-2 rounded-md cursor-pointe';

   return (
      <div className='bg-white p-4 rounded-xl'>
         <p className='text-xl font-semibold mb-4 text-blue-500'>
            Did you confirm ?
         </p>

         <p className='break-all'>
            Autem sed ut veniam et. Et maxime sed culpa molestiae. Nisi et rerum
            incidunt unde ea iure. Reiciendis odio unde inventore quia ullam
            voluptatem sit exercitationem. Et odit commodi earum rem temporibus
            facere vero sit. Dignissimos quo molestiae magnam sequi facere qui
            explicabo est ad. Quidem et eius veniam et qui quas minima
            reprehenderit. Maxime amet dolores ut vel. Sed delectus ut et totam.
            Et dolorum ut enim et est voluptatem eaque quisquam. Tempore
            perspiciatis dolorum nihil labore suscipit et blanditiis. Est magni
            autem. Fuga ab aut cum sit distinctio eos.
         </p>

         <div className='flex items-center justify-end gap-2 mt-4 '>
            <div
               className={clsx('bg-gray-500 hover:bg-gray-600', className)}
               onClick={() => closeModal()}
            >
               <p>OK</p>
            </div>

            <div
               className={clsx('bg-blue-400 hover:bg-blue-600', className)}
               onClick={() => closeModal()}
            >
               <p>Cancel</p>
            </div>
         </div>
      </div>
   );
};
