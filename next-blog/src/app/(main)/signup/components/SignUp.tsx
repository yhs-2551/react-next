"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signupUser } from "@/services/api";

interface SignUpFormData {
    blogId: string; // URL용 ID
    nickName: string; // 표시 이름(닉네임)
    email: string;
    password: string;
    passwordConfirm: string;
}

interface AvailabilityErrors {
    email: string;
    blogId: string;
}

interface AvailabilityLoadingState {
    email: boolean;
    blogId: boolean;
}

function SignUp() {
    const [showModal, setShowModal] = useState<boolean>(true);

    const [formData, setFormData] = useState<SignUpFormData>({
        blogId: "", // URL용 ID
        nickName: "", // 표시이름(닉네임)
        email: "",
        password: "",
        passwordConfirm: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isCheckingAvailabilityErrors, setIsCheckingAvailabilityErrors] = useState<AvailabilityErrors>({
        email: "",
        blogId: "",
    });

    // 이메일 및 블로그 ID 중복 확인 중 로딩 상태
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState<AvailabilityLoadingState>({
        email: false,
        blogId: false,
    });

    const [validateErrors, setValidatorErrors] = useState<Record<string, string>>({});
    const [errorMessageFromServer, setErrorMessageFromServer] = useState<string | null>(null);

    // 최종적으로 회원가입 버튼 클릭 시 로딩 상태
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const validatePassword = (password: string) => {
        // 한글 체크
        if (/[가-힣]/.test(password)) {
            return ["비밀번호에 한글은 사용할 수 없습니다"];
        }

        // 첫 글자 대문자 체크
        if (!/^[A-Z]/.test(password)) {
            return ["첫 글자는 반드시 대문자여야 합니다"];
        }

        // 길이 체크
        if (password.length < 8) {
            return ["비밀번호는 8자 이상이어야 합니다"];
        }

        // 나머지 조건 체크
        const conditions = [
            { test: /[a-z]/, message: "소문자" },
            { test: /[0-9]/, message: "숫자" },
            { test: /[!@#$%^&*(),.?":{}|<>]/, message: "특수문자" },
        ];

        const failedConditions = conditions.filter((condition) => !condition.test.test(password)).map((condition) => condition.message);

        if (failedConditions.length > 0) {
            return [`비밀번호에 ${failedConditions.join(", ")}를 포함해야 합니다`];
        }

        return [];
    };

    const validateForm = () => {
        const validateErrors: Record<string, string> = {};

        // 블로그 ID 검증
        if (!formData.blogId.trim()) {
            validateErrors.blogId = "블로그의 고유 ID를 입력해주세요";
        } else if (!/^[a-z0-9-_]{3,20}$/.test(formData.blogId)) {
            validateErrors.blogId = "영문 소문자, 숫자, 하이픈, 언더스코어만 사용 가능합니다 (3-20자)";
        }

        // 닉네임 검증
        if (!formData.nickName.trim()) {
            validateErrors.nickName = "닉네임을 입력해주세요";
        } else if (formData.nickName.length < 2 || formData.nickName.length > 10) {
            validateErrors.nickName = "닉네임은 2-10자 사이여야 합니다";
        }
        // 이메일 검증
        if (!formData.email.trim()) {
            validateErrors.email = "이메일을 입력해주세요";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            validateErrors.email = "올바른 이메일 형식이 아닙니다";
        }

        // 비밀번호 검증
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            validateErrors.password = passwordErrors.join(", ");
        }

        if (formData.password !== formData.passwordConfirm) {
            validateErrors.passwordConfirm = "비밀번호가 일치하지 않습니다";
        }

        setValidatorErrors(validateErrors);
        return Object.keys(validateErrors).length === 0;
    };

    // 이메일 중복 확인
    const checkEmailAvailability = async () => {
        setIsAvailabilityLoading((prev) => ({ ...prev, email: true }));
        try {
            // api 호출 부분             const isAvailable = true; 아래는 임시
            // const isAvailable = await checkEmail(formData.email);
            const isAvailable = true;

            if (!isAvailable) {
                setIsCheckingAvailabilityErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다" }));
                return false;
            }
            setIsCheckingAvailabilityErrors((prev) => ({ ...prev, email: "" }));
            return true;
        } catch (error) {
            setIsCheckingAvailabilityErrors((prev) => ({ ...prev, email: "이메일 확인 중 오류가 발생했습니다" }));
            return false;
        } finally {
            setIsAvailabilityLoading((prev) => ({ ...prev, email: false }));
        }
    };

    // 블로그 고유 ID 중복 확인
    const checkBlogIdAvailability = async () => {
        setIsAvailabilityLoading((prev) => ({ ...prev, blogId: true }));
        try {
            // api 호출 부분
            // const isAvailable = await checkBlogId(formData.blogId);
            const isAvailable = true;
            if (!isAvailable) {
                setIsCheckingAvailabilityErrors((prev) => ({ ...prev, blogId: "이미 사용 중인 블로그 ID 입니다" }));
                return false;
            }
            setIsCheckingAvailabilityErrors((prev) => ({ ...prev, blogId: "" }));
            return true;
        } catch (error) {
            setIsCheckingAvailabilityErrors((prev) => ({ ...prev, blogId: "블로그 주소 확인 중 오류가 발생했습니다" }));
            return false;
        } finally {
            setIsAvailabilityLoading((prev) => ({ ...prev, blogId: false }));
        }
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // 비밀번호 재확인은 빼고 서버측으로 전송
            const { passwordConfirm, ...signupPayload } = formData;

            const response = await signupUser(signupPayload);
            console.log("회원가입 성공 SignUp Page", response);
            setShowModal(false);
            setTimeout(() => router.push("/"), 300); // 성공 시 홈으로 리다이렉트
        } catch (error: any) {
            console.log("회원가입 실패 SignUp Page: ", error);
            // setErrorMessageFromServer(error.message);
            setErrorMessageFromServer("회원가입 중 오류가 발생했습니다");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setTimeout(() => router.push("/"), 300); // 애니메이션이 끝난 후 홈으로 리다이렉트
    };

    return (
        showModal && (
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
                  

                            {/* 오른쪽 부분 - 회원가입 폼 */}
                            <div className='w-full p-6'>
                                <div className='flex justify-between items-center mb-6'>
                                    <h2 className='text-2xl font-bold text-gray-800'>회원가입</h2>
                                    <button className='text-gray-600 hover:text-black' onClick={handleCloseModal}>
                                        닫기
                                    </button>
                                </div>

                                {/* w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 */}

                                <p className='text-gray-600 mb-4'>이메일로 회원가입</p>
                                <form onSubmit={handleSignUp}>
                                    {/* 블로그 ID 입력 */}
                                    <div>
                                        <label className='block text-sm font-medium mb-1'>
                                            블로그 고유 ID <span className='text-red-500'>*</span>
                                        </label>
                                        <div className='flex gap-2'>
                                            <input
                                                type='text'
                                                value={formData.blogId}
                                                onChange={(e) => setFormData({ ...formData, blogId: e.target.value })}
                                                className='flex-1 p-2 border rounded'
                                                placeholder='영문, 숫자, 하이픈, 언더스코어만 사용가능 (3-20자)'
                                            />
                                            <button
                                                type='button'
                                                onClick={checkBlogIdAvailability}
                                                disabled={isAvailabilityLoading.blogId}
                                                className='px-4 py-2 bg-blue-500 text-white rounded'
                                            >
                                                {isAvailabilityLoading.blogId ? "확인중..." : "중복확인"}
                                            </button>
                                        </div>
                                        {validateErrors.blogId && <p className='text-red-500 text-sm mt-1'>{validateErrors.blogId}</p>}
                                        {isCheckingAvailabilityErrors.blogId && (
                                            <p className='text-red-500 text-sm mt-1'>{isCheckingAvailabilityErrors.blogId}</p>
                                        )}
                                    </div>

                                    {/* 닉네임 입력 */}
                                    <div>
                                        <label className='block text-sm font-medium mb-1'>
                                            사용자명 <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type='text'
                                            value={formData.nickName}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, nickName: e.target.value }))}
                                            className='w-full p-2 border rounded'
                                            placeholder='2-10자 사이 입력'
                                        />
                                        {validateErrors.nickName && <p className='text-red-500 text-sm mt-1'>{validateErrors.nickName}</p>}
                                    </div>

                                    {/* 이메일 입력  */}
                                    <div>
                                        <label className='block text-sm font-medium mb-1'>
                                            이메일 <span className='text-red-500'>*</span>
                                        </label>
                                        <div className='flex gap-2'>
                                            <input
                                                type='email'
                                                value={formData.email}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                                className='flex-1 p-2 border rounded'
                                                placeholder='example@email.com'
                                            />
                                        </div>

                                        <button
                                            type='button'
                                            onClick={checkEmailAvailability}
                                            disabled={isAvailabilityLoading.email}
                                            className='px-4 py-2 bg-blue-500 text-white rounded'
                                        >
                                            {isAvailabilityLoading.email ? "확인중..." : "중복확인"}
                                        </button>
                                        {validateErrors.email && <p className='text-red-500 text-sm mt-1'>{validateErrors.email}</p>}
                                        {isCheckingAvailabilityErrors.email && (
                                            <p className='text-red-500 text-sm mt-1'>{isCheckingAvailabilityErrors.email}</p>
                                        )}
                                    </div>

                                    {/* 비밀번호 입력  */}
                                    <div>
                                        <label className='block text-sm font-medium mb-1'>
                                            비밀번호 <span className='text-red-500'>*</span>
                                        </label>
                                        <div className='relative'>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                                className='w-full p-2 border rounded'
                                                placeholder='영문만 사용, 첫 글자 대문자, 8자 이상, 소문자/숫자/특수문자 포함'
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setShowPassword(!showPassword)}
                                                className='absolute right-2 top-1/2 transform -translate-y-1/2'
                                            >
                                                {showPassword ? "숨기기" : "보기"}
                                            </button>
                                        </div>
                                        {validateErrors.password && <p className='text-red-500 text-sm mt-1'>{validateErrors.password}</p>}
                                    </div>

                                    {/* 비밀번호 재확인  */}
                                    <div>
                                        <label className='block text-sm font-medium mb-1'>
                                            비밀번호 확인 <span className='text-red-500'>*</span>
                                        </label>
                                        <div className='relative'>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.passwordConfirm}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, passwordConfirm: e.target.value }))}
                                                className='w-full p-2 border rounded'
                                                placeholder='비밀번호를 다시 입력해주세요'
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className='absolute right-2 top-1/2 transform -translate-y-1/2'
                                            >
                                                {showConfirmPassword ? "숨기기" : "보기"}
                                            </button>
                                        </div>
                                        {validateErrors.passwordConfirm && (
                                            <p className='text-red-500 text-sm mt-1'>{validateErrors.passwordConfirm}</p>
                                        )}
                                    </div>

                                    <button
                                        type='submit'
                                        className='w-full py-2 mt-2 text-white bg-green-500 rounded-lg hover:bg-green-600'
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "처리중..." : "회원가입"}
                                    </button>

                                    {errorMessageFromServer && <p className='text-sm text-red-500 mb-4'>{errorMessageFromServer}</p>}
                                </form>

                                <div className='text-center mt-6'>
                                    <p className='text-sm text-gray-600'>
                                        계정이 이미 있으신가요?{" "}
                                        <a
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.push("/login");
                                            }}
                                            className='cursor-pointer text-green-500 hover:underline'
                                        >
                                            로그인
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    );
}

export default SignUp;
