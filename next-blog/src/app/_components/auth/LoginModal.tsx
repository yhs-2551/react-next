"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDebounce } from "use-debounce";

import { FcGoogle } from "react-icons/fc";

import { loginUser } from "@/services/api";

import { useAuthStore } from "@/store/appStore";
import { CustomHttpError } from "@/utils/CustomHttpError";

export interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

type LoginFormDataWithoutRememberMe = Omit<LoginFormData, "rememberMe">;

function LoginModal() {
    const [isClosing, setIsClosing] = useState<boolean>(false);

    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        rememberMe: false,
    });

    const [formValidateErrors, setFormValidatorErrors] = useState<LoginFormDataWithoutRememberMe>({
        email: "",
        password: "",
    });

    // 폼 입력값이 시작되었는지 여부. 폼 입력이 시작되어야 유효성 검사를 시작한다.
    const [hasInteracted, setHasInteracted] = useState<Record<string, boolean>>({
        email: false,
        password: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const [loginErrors, setLoginErrors] = useState<string>("");
    const [loginRateLimitErrors, setLoginRateLimitErrors] = useState<string>("");

    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const { setShowLogin, setShowSignUp, setAuthenticated } = useAuthStore();

    const [debouncedEmail] = useDebounce(formData.email, 500);
    const [debouncedPassword] = useDebounce(formData.password, 300);

    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!hasInteracted.email) return;

        if (debouncedEmail.trim() === "") {
            setFormValidatorErrors((prev) => ({ ...prev, email: "이메일을 입력해주세요" }));
            return;
        }
        if (!/\S+@\S+\.\S+/.test(debouncedEmail)) {
            setFormValidatorErrors((prev) => ({ ...prev, email: "올바른 이메일 형식이 아닙니다" }));
            return;
        }
        setFormValidatorErrors((prev) => ({ ...prev, email: "" }));
    }, [debouncedEmail]);

    useEffect(() => {
        if (!hasInteracted.password) return;

        if (debouncedPassword.trim() === "") {
            setFormValidatorErrors((prev) => ({ ...prev, password: "패스워드를 입력해주세요" }));
            return;
        }

        setFormValidatorErrors((prev) => ({ ...prev, password: "" }));
    }, [debouncedPassword]);

    // 모든 필드가 유효한지 확인
    const isFormValid = (): boolean => {
        // 1. 모든 필드가 입력되었는지 확인
        const isAllFieldsFilled = Object.keys(formData)
            .filter((field) => field !== "rememberMe")
            .every((field) => formData[field as keyof LoginFormDataWithoutRememberMe].trim() !== "");

        // 2. 유효성 검증 에러가 없는지 확인
        const hasNoValidationErrors = Object.keys(formValidateErrors).every(
            (field) => formValidateErrors[field as keyof LoginFormDataWithoutRememberMe] === ""
        );

        return isAllFieldsFilled && hasNoValidationErrors;
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            await loginUser(formData);

            // 닫는 애니메이션 효과 시작
            setIsClosing(true);

            // 모달 닫기
            setTimeout(() => {
                setShowLogin(false);
            }, 300);

            setTimeout(() => {
                //   window.location.reload();
                setAuthenticated(true);
            }, 350);
        } catch (error: unknown) {
            if (error instanceof CustomHttpError) {
                if (error.status === 429) {
                    setLoginRateLimitErrors(error.message);
                    setLoginErrors("");
                    setTimeout(() => {
                        setLoginRateLimitErrors("");
                    }, 60000);
                } else {
                    setLoginErrors(error.message);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setHasInteracted((prev) => ({ ...prev, [name]: true }));
        setLoginErrors("");
    };

    const handleCloseModal = () => {
        setIsClosing(true);
    };

    const handleGoogleLogin = () => {
        const currentPath = pathname + searchParams.toString();
        sessionStorage.setItem("lastVisitedPath", currentPath);

        // rememberMe는 boolean인데 template literal에서 자동으로 string으로 변환됨
        window.location.assign(`${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/google?remember_me=${formData.rememberMe}`);
    };

    return (
        <div className='fixed inset-0 z-[1500] flex items-center justify-center overflow-hidden bg-black bg-opacity-30'>
            <AnimatePresence
                mode='wait'
                onExitComplete={() => {
                    setShowLogin(false);
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

                            <div className='flex items-center justify-between mb-4'>
                                <label className='flex items-center'>
                                    <input
                                        type='checkbox'
                                        checked={formData.rememberMe}
                                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                        className='mr-2'
                                    />
                                    <span className='text-sm'>로그인 상태 유지</span>
                                </label>
                                {/* <button
                                        type='button'
                                        onClick={() => router.push("/forgot-password")}
                                        className='text-sm text-blue-600 hover:underline'
                                    >
                                        비밀번호 찾기
                                    </button> */}
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className='mb-4'>
                                    <input
                                        type='email'
                                        name='email'
                                        placeholder='이메일을 입력하세요.'
                                        className='w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={formData.email}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(formValidateErrors.email)}
                                    />
                                    {formValidateErrors.email && <p className='mt-1 text-sm text-red-600'>{formValidateErrors.email}</p>}
                                </div>
                                <div className='mb-4 relative'>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name='password'
                                        placeholder='비밀번호를 입력하세요.'
                                        className='w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={formData.password}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(formValidateErrors.password)}
                                    />
                                    {formValidateErrors.password && <p className='mt-1 text-sm text-red-600'>{formValidateErrors.password}</p>}
                                    <button
                                        type='button'
                                        onClick={() => setShowPassword(!showPassword)}
                                        className='absolute right-2 top-1/2 transform -translate-y-1/2'
                                    >
                                        {showPassword ? "숨기기" : "보기"}
                                    </button>
                                </div>

                                <button
                                    type='submit'
                                    className={`w-full py-2 mt-2 rounded-lg transition-all duration-200 ${
                                        loginRateLimitErrors === "" && isFormValid()
                                            ? "bg-green-500 hover:bg-green-600 text-white"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                    disabled={!isFormValid() || isLoading || loginRateLimitErrors !== ""}
                                >
                                    {isLoading ? "로그인 중..." : "로그인"}
                                </button>
                            </form>

                            {/* 로그인 실패 시 오류 메시지 표시 아이디 및 패스워드가 잘못되었을 때*/}
                            {loginErrors && <p className='text-sm text-red-500 mt-4'>{loginErrors}</p>}
                            {loginRateLimitErrors && <p className='text-sm text-red-500 mt-4'>{loginRateLimitErrors}</p>}

                            <div className='mt-6 mb-4 text-center'>
                                <p className='text-gray-600'>소셜 계정으로 로그인</p>
                            </div>
                            <div className='flex justify-center space-x-4 mb-4'>
                                <button
                                    className='flex items-center justify-center gap-3 px-6 py-2.5 border border-gray-300 rounded-lg
                                    hover:shadow-md hover:border-gray-400 transition-all duration-200 bg-white
                                    text-gray-700 font-medium text-sm'
                                    onClick={handleGoogleLogin}
                                >
                                    <FcGoogle className='text-xl' />
                                    <span>Google로 계속하기</span>
                                </button>
                            </div>
                            <div className='text-center mt-6'>
                                <p className='text-sm text-gray-600'>
                                    아직 회원이 아니신가요?{" "}
                                    <a
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsClosing(true); // 닫는 애니메이션 효과 시작
                                            // 애니메이션이 종료된 후 작업
                                            setTimeout(() => {
                                                setShowLogin(false);
                                                setShowSignUp(true);
                                            }, 300); //animation duration과 최대한 매칭시켜야함
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

export default LoginModal;
