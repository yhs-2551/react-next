interface ConfirmModalProps {
    modalRef: React.RefObject<HTMLDivElement>;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmModal({ modalRef, onClose, onConfirm }: ConfirmModalProps) {
    return (
        <div ref={modalRef} className='hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]'>
            <div className='bg-white rounded-lg p-6 w-[400px]'>
                <p className='text-center mb-6'>
                    작성 중인 내용은 저장되지 않습니다.
                    <br />
                    정말 나가시겠습니까?
                </p>
                <div className='flex justify-center'>
                    <button
                        onClick={onClose}
                        className='px-6 py-2.5 bg-gray-800 text-white rounded-md mr-2 focus:outline-none hover:bg-gray-700 hover:text-white active:bg-gray-800 border border-gray-300 transition-colors opacity-80'
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className='px-6 py-2.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none active:bg-gray-800 transition-colors'
                    >
                        나가기
                    </button>
                </div>
            </div>
        </div>
    );
}
