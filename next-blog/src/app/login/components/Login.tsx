"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { loginUser } from "@/services/api";

function Login() {

    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
 
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        
        e.preventDefault();

        const formData = { email, password };

        try {
            await loginUser(formData);
            setShowModal(false);
            setTimeout(() => router.push("/"), 300); // 애니메이션이 끝난 후 홈으로 리다이렉트
        } catch (error: any) {
            setErrorMessage("아이디 또는 비밀번호가 잘못 되었습니다.");
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        // setTimeout(() => router.push("/"), 300); // 애니메이션이 끝난 후 홈으로 리다이렉트
    };

    const handleGoogleLogin = () => {
        window.location.href =
            "http://localhost:8000/oauth2/authorization/google";
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
                                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                                    handleLogin(e);
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

                            {/* 로그인 실패 시 오류 메시지 표시 */}
                            {errorMessage && (
                                <p className='text-sm text-red-500 mt-4'>
                                    {errorMessage}
                                </p>
                            )}

                            <div className='mt-6 mb-4 text-center'>
                                <p className='text-gray-600'>
                                    소셜 계정으로 로그인
                                </p>
                            </div>
                            <div className='flex justify-center space-x-4 mb-4'>
                                <button className='text-black'>
                                    <i className='fab fa-github fa-2x'></i>
                                </button>
                                <button onClick={handleGoogleLogin}>
                                    <FontAwesomeIcon
                                        icon={faGoogle}
                                        size='lg'
                                        style={{ color: "#74C0FC" }}
                                    />
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
        </div>
    );
}

export default Login;
