import type { ModalParams } from '#types/modal.type';

export const ConfirmModal = ({ closeModal }: ModalParams<'ConfirmModal'>) => {
   return (
      <div className='example-modal'>
         <p className='example-modal-title example-modal-title--confirm'>
            Did you confirm ?
         </p>

         <p className='example-modal-text'>
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

         <div className='example-modal-actions'>
            <button
               type='button'
               className='example-modal-button example-modal-button--gray'
               onClick={() => closeModal()}
            >
               OK
            </button>

            <button
               type='button'
               className='example-modal-button example-modal-button--primary'
               onClick={() => closeModal()}
            >
               Cancel
            </button>
         </div>
      </div>
   );
};
