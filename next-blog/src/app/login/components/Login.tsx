"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import useLogin from "@/customHooks/useLogin";
import Modal from "@/app/posts/(common)/Modal/Modal";

function Login() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(true);
    const [isSuccessModalOpen, setIsSuccessModalOpen] =
        useState<boolean>(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);

    const loginMutation = useLogin();

    const handleLogin = () => {

        loginMutation.mutate(
            {
                email,
                password,
            },
            {
                onSuccess: () => {
                    setShowModal(false);
                    setIsSuccessModalOpen(true);
                },
                onError: () => {
                    setShowModal(false);
                    setIsErrorModalOpen(true);
                },
            }
        );
    };

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
        router.push("/"); // 로그인 성공 후 홈으로 리다이렉트
    };

    const handleCloseErrorModal = () => {
        setIsErrorModalOpen(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setTimeout(() => router.push("/"), 300); // 애니메이션이 끝난 후 홈으로 리다이렉트
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black bg-opacity-30'>
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ y: "100vh", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100vh", opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 270,
                            damping: 30,
                        }}
                        className='relative flex w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg'
                    >
                        {/* 왼쪽 부분 - 이미지와 텍스트 */}
                        <div className='flex flex-col items-center justify-center w-1/2 p-6 bg-gray-100 rounded-l-lg'>
                            {/* <Image
                                src='/profile.png'
                                width={150}
                                height={150}
                                alt='환영 이미지'
                            /> */}
                            <h2 className='mt-4 text-xl font-semibold text-gray-800'>
                                환영합니다!
                            </h2>
                        </div>

                        {/* 오른쪽 부분 - 로그인 폼 */}
                        <div className='w-1/2 p-6'>
                            <div className='flex justify-between items-center mb-6'>
                                <h2 className='text-2xl font-bold text-gray-800'>
                                    로그인
                                </h2>
                                <button
                                    className='text-gray-600 hover:text-black'
                                    onClick={handleCloseModal}
                                >
                                    닫기
                                </button>
                            </div>

                            <p className='text-gray-600 mb-4'>
                                이메일로 로그인
                            </p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleLogin();
                                }}
                            >
                                <div className='mb-4'>
                                    <input
                                        type='email'
                                        placeholder='이메일을 입력하세요.'
                                        className='w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className='mb-4'>
                                    <input
                                        type='password'
                                        placeholder='비밀번호를 입력하세요.'
                                        className='w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <button
                                    type='submit'
                                    className='w-full py-2 mt-2 text-white bg-green-500 rounded-lg hover:bg-green-600'
                                >
                                    로그인
                                </button>
                            </form>

                            <div className='mt-6 mb-4 text-center'>
                                <p className='text-gray-600'>
                                    소셜 계정으로 로그인
                                </p>
                            </div>
                            <div className='flex justify-center space-x-4 mb-4'>
                                <button className='text-black'>
                                    <i className='fab fa-github fa-2x'></i>
                                </button>
                                <button className='text-blue-500'>
                                    <i className='fab fa-google fa-2x'></i>
                                </button>
                                <button className='text-blue-700'>
                                    <i className='fab fa-facebook fa-2x'></i>
                                </button>
                            </div>
                            <div className='text-center mt-6'>
                                <p className='text-sm text-gray-600'>
                                    아직 회원이 아니신가요?{" "}
                                    <a
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.push("/signup");
                                        }}
                                        className='cursor-pointer text-green-500 hover:underline'
                                    >
                                        회원가입
                                    </a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 성공 및 실패 모달 */}
            <Modal
                isOpen={isSuccessModalOpen}
                onClose={handleCloseSuccessModal}
                title='로그인 성공'
                content='로그인에 성공했습니다!'
            />

            <Modal
                isOpen={isErrorModalOpen}
                onClose={handleCloseErrorModal}
                title='로그인 실패'
                content='로그인에 실패했습니다. 다시 시도해주세요.'
            />
            
        </div>
    );
}

export default Login;
