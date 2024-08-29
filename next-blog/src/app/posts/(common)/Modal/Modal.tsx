import { useRouter } from "next/navigation";
import React from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

function Modal({ isOpen, onClose, title, content }: ModalProps) {
    const router = useRouter();
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center'>
            <div className='bg-white p-6 rounded-md shadow-md w-96'>
                <h2 className='text-2xl font-bold mb-4'>{title}</h2>
                <p>{content}</p>
                <div className='flex justify-end mt-4'>
                    <button
                        className='px-4 py-2 bg-purple-600 text-white rounded-md'
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
