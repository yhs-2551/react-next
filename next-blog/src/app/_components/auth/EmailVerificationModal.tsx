// app/_components/auth/EmailVerificationModal.tsx
"use client";

import { verifyEmailCode } from "@/services/api";
import { useAuthStore } from "@/store/appStore";
import { motion, AnimatePresence } from "framer-motion";
import { Dispatch, SetStateAction, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

interface EmailVerificationModalProps {
    email: string;
    onClose: (setIsClosing: Dispatch<SetStateAction<boolean>>) => void;
    onVerified: () => void;
}
{
}
export default function EmailVerificationModal({ email, onClose, onVerified }: EmailVerificationModalProps) {
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [code, setCode] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const { setShowEmailVerification } = useAuthStore();

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const verifyResponse = await verifyEmailCode(email, code);
            if (verifyResponse.status === 200 || verifyResponse.status === 201) {
                toast.success(
                    <span>
                        <span style={{ fontSize: "1.2rem" }}>!</span>&nbsp;&nbsp;&nbsp;&nbsp;
                        <span style={{ fontSize: "0.9rem" }}>{verifyResponse.message}</span>
                    </span>,
                    {
                        autoClose: 3000, // 2초
                        style: {
                            padding: "16px",
                        },
                    }
                );

                setIsClosing(true);
                onVerified();

                // <span style={{ fontSize: "1.1rem" }}>!</span>&nbsp;&nbsp;&nbsp;&nbsp;{" "}
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black/30'>
            <AnimatePresence
                mode='wait'
                onExitComplete={() => {
                    setShowEmailVerification(false);
                    setIsClosing(false);
                }}
            >
                {!isClosing && (
                    <motion.div
                        initial={{ y: "100vh", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100vh", opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 270,
                            damping: 30,
                        }}
                        className='relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6'
                    >
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-2xl font-bold text-gray-800'>이메일 인증</h2>
                            <button className='text-gray-600 hover:text-black' onClick={() => onClose(setIsClosing)}>
                                닫기
                            </button>
                        </div>

                        <div className='text-center mb-6'>
                            <p className='text-gray-600'>
                                {email}로 전송된
                                <br />
                                인증 코드를 입력해주세요
                            </p>
                        </div>

                        <form onSubmit={handleVerification} className='space-y-4'>
                            <div>
                                <input
                                    type='text'
                                    placeholder='인증 코드 6자리'
                                    className='w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                />
                                {error && <p className='text-sm text-red-500 mt-2'>{error}</p>}
                            </div>

                            <button
                                type='submit'
                                disabled={isLoading || code.length !== 6}
                                className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors'
                            >
                                {isLoading ? "확인 중..." : "인증하기"}
                            </button>

                            <div className='text-center'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        /* 재전송 로직 */
                                    }}
                                    className='text-sm text-blue-600 hover:underline'
                                >
                                    인증 코드 재전송
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
