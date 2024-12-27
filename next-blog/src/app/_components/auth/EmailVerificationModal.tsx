// app/_components/auth/EmailVerificationModal.tsx
"use client";

import { signupUser, verifyEmailCode } from "@/services/api";
import { useAuthStore } from "@/store/appStore";
import { SignupUser } from "@/types/SignupUserTypes";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { motion, AnimatePresence } from "framer-motion";
import { ChangeEvent, Dispatch, MouseEvent, SetStateAction, useState } from "react";
import { toast } from "react-toastify";

interface EmailVerificationModalProps {
    user: SignupUser;
}

export default function EmailVerificationModal({ user }: EmailVerificationModalProps) {
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [code, setCode] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isReIssueLoading, setIsReIssueLoading] = useState<boolean>(false);

    const [verifyCodeErrors, setVerifyCodeErrors] = useState<string>("");
    const [verifyCodeRateLimitErrors, setVerifyCodeRateLimitErrors] = useState<string>("");

    const [reIssueSuccessMessage, setReIssueSuccessMessage] = useState<string>("");
    const [reIssueFailMessage, setReIssueFailMessage] = useState<string>("");
    const [reIssueCodeRateLimitErrors, setReIssueCodeRateLimitErrors] = useState<string>("");

    const { setShowEmailVerification, setSignupUser } = useAuthStore();

    console.log("signUpUserEmail", user.email);
    console.log("signUpUser", user);

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();

        setVerifyCodeErrors("");
        setIsLoading(true);
        try {
            const verifyResponse = await verifyEmailCode(user.email, code);
            if (verifyResponse.status === 200 || verifyResponse.status === 201) {
                setSignupUser({ blogId: "", username: "", email: "", password: "", passwordConfirm: "" });
                console.log("signUpUser", user);

                handleModalClose();

                setTimeout(() => {
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
                }, 500);

                // <span style={{ fontSize: "1.1rem" }}>!</span>&nbsp;&nbsp;&nbsp;&nbsp;{" "}
            }
        } catch (error: unknown) {
            if (error instanceof CustomHttpError) {
                if (error.status === 429) {
                    setVerifyCodeRateLimitErrors(error.message);
                    setTimeout(() => {
                        setVerifyCodeRateLimitErrors("");
                    }, 60000);
                } else {
                    setVerifyCodeErrors(error.message);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
        setVerifyCodeErrors("");
    };

    const handleReissue = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        setReIssueSuccessMessage("");
        setReIssueFailMessage("");
        setIsReIssueLoading(true);

        try {
            const response = await signupUser(user);
            setReIssueSuccessMessage(response.message);
        } catch (error: unknown) {
            if (error instanceof CustomHttpError) {
                if (error.status === 429) {
                    setReIssueCodeRateLimitErrors(error.message);
                    setTimeout(() => {
                        setReIssueCodeRateLimitErrors("");
                    }, 60000);
                } else {
                    console.error("인증코드 재발급 실패 ", error);
                    setReIssueFailMessage(error.message);
                }
            }
        } finally {
            setIsReIssueLoading(false);
        }
    };

    const handleModalClose = () => {
        setIsClosing(true); // 종료 애니메이션 효과 시작
        // 종료 애니메이션 효과가 끝나고 실제 이메일 인증 모달을 화면에 보이지 않게함. 아래 코드가 없다면 인증 모달이 다시 위로 올라와서 화면에 남아있게 됨
        setTimeout(() => {
            setShowEmailVerification(false);
        }, 300);
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
                            <button className='text-gray-600 hover:text-black' onClick={() => handleModalClose()}>
                                닫기
                            </button>
                        </div>

                        <div className='text-center mb-6'>
                            <p className='text-gray-600'>
                                {user.email}로 전송된
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
                                    onChange={handleInput}
                                    maxLength={6}
                                />
                                {verifyCodeErrors && <p className='text-sm text-red-500 mt-2'>{verifyCodeErrors}</p>}
                                {verifyCodeRateLimitErrors && <p className='text-sm text-red-500 mt-2'>{verifyCodeRateLimitErrors}</p>}
                            </div>

                            <button
                                type='submit'
                                disabled={isLoading || code.length !== 6 || !(verifyCodeRateLimitErrors === "")}
                                className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors'
                            >
                                {isLoading ? "확인 중..." : "인증하기"}
                            </button>

                            <div className='text-center'>
                                <button
                                    type='button'
                                    disabled={!(reIssueCodeRateLimitErrors === "")}
                                    onClick={handleReissue}
                                    className='text-sm text-blue-600 hover:underline'
                                >
                                    {isReIssueLoading ? "재발급중..." : "  인증 코드 재발급"}
                                </button>
                                {reIssueSuccessMessage && <p className='text-sm text-green-500 mt-2'>{reIssueSuccessMessage}</p>}
                                {reIssueFailMessage && <p className='text-sm text-red-500 mt-2'>{reIssueFailMessage}</p>}
                                {reIssueCodeRateLimitErrors && <p className='text-sm text-red-500 mt-2'>{reIssueCodeRateLimitErrors}</p>}
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
