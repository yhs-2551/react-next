"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { loginUser } from "@/services/api";


export interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
  }
  

function Login() {

    const [showModal, setShowModal] = useState<boolean>(true);
    
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    
    const [errorMessageFromServer, setErrorMessageFromServer] = useState<string>("");
    
    const [loginAttempts, setLoginAttempts] = useState(0);
    
    const [isLoading, setIsLoading] = useState(false);

    const currentPath = usePathname();

    const router = useRouter();


    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = "이메일을 입력하세요.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            // S는 Space즉 공백을 의미, /.../ 정규 표현식 시작. 해석: 공백을 제외한 하나 아싱의 문자 + @ + 공백을 제외한 하나 이상의 문자 + . + 공백을 제외한 하나 이상의 문자
            newErrors.email = "올바른 이메일 형식이 아닙니다.";
        }

        if (!formData.password.trim()) {
            newErrors.password = "비밀번호를 입력하세요.";
        }

        setFormErrors(newErrors);
        // 키의 갯수가 0이면 유효성 검사 통과
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 시간 기반 제한 해제 로직 추가해야함
        if (loginAttempts >= 5) {
            setFormErrors({ general: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." });
            return;
        }

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await loginUser(formData);

            if (formData.rememberMe) {
                localStorage.setItem("rememberedEmail", formData.email);
            }

            setShowModal(false);

            window.location.assign(currentPath);

            // setTimeout(() => {
            //     const lastUrl = localStorage.getItem("lastVisitedUrl") || "/";
            //     localStorage.removeItem("lastVisitedUrl");
            //     window.location.assign(lastUrl);
            // }, 300); // 애니메이션이 끝난 후 홈으로 리다이렉트
        } catch (error: any) {
            setLoginAttempts((prev) => prev + 1);
            setErrorMessageFromServer("아이디 또는 비밀번호가 잘못 되었습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        // setTimeout(() => router.push("/"), 300); // 애니메이션이 끝난 후 홈으로 리다이렉트
    };

    const handleGoogleLogin = () => {
        window.location.assign(`${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/google`);
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
                            <h2 className='mt-4 text-xl font-semibold text-gray-800'>환영합니다!</h2>
                        </div>

                        {/* 오른쪽 부분 - 로그인 폼 */}
                        <div className='w-1/2 p-6'>
                            <div className='flex justify-between items-center mb-6'>
                                <h2 className='text-2xl font-bold text-gray-800'>로그인</h2>
                                <button className='text-gray-600 hover:text-black' onClick={handleCloseModal}>
                                    닫기
                                </button>
                            </div>

                            <p className='text-gray-600 mb-4'>이메일로 로그인</p>
                            <form
                                onSubmit={handleLogin}
                            >
                                <div className='mb-4'>
                                    <input
                                        type='email'
                                        placeholder='이메일을 입력하세요.'
                                        className='w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        aria-invalid={Boolean(formErrors.email)}
                                    />
                                    {formErrors.email && <p className='mt-1 text-sm text-red-600'>{formErrors.email}</p>}
                                </div>
                                <div className='mb-4 relative'>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder='비밀번호를 입력하세요.'
                                        className='w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        aria-invalid={Boolean(formErrors.password)}
                                    />
                                     {formErrors.password && <p className='mt-1 text-sm text-red-600'>{formErrors.password}</p>}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-2 top-1/2 transform -translate-y-1/2'
                                >
                                    {showPassword ? "숨기기" : "보기"}
                                </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.rememberMe}
                                            onChange={e => setFormData({...formData, rememberMe: e.target.checked})}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">로그인 상태 유지</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/forgot-password")}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        비밀번호 찾기
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                                >
                                    {isLoading ? "로그인 중..." : "로그인"}
                                </button>
                            </form>

                            {/* 로그인 실패 시 오류 메시지 표시 아이디 및 패스워드가 잘못되었을 때*/}
                            {errorMessageFromServer && <p className='text-sm text-red-500 mt-4'>{errorMessageFromServer}</p>}

                            <div className='mt-6 mb-4 text-center'>
                                <p className='text-gray-600'>소셜 계정으로 로그인</p>
                            </div>
                            <div className='flex justify-center space-x-4 mb-4'>
                                <button className='text-black'>
                                    <i className='fab fa-github fa-2x'></i>
                                </button>
                                <button onClick={handleGoogleLogin}>
                                    {/* <FontAwesomeIcon
                                        icon={faGoogle}
                                        size='lg'
                                        style={{ color: "#74C0FC" }}
                                    /> */}
                                    구글 로그인
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
