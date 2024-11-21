"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signupUser } from "@/services/api";
import { useDebounce } from "use-debounce";
import { useAvailabilityThrottle } from "@/customHooks/useAvailabilityThrottle";
import { useAuthStore } from "@/store/appStore";

// 폼 필드 타입 정의
type FormField = "blogId" | "userName" | "email" | "password" | "passwordConfirm";
type AvailabilityField = "blogId" | "userName" | "email";
type AvailabilityConfig = {
    duplicateErrorMessage: string;
    serverErrorMessage: string;
};

interface SignUpFormData {
    blogId: string; // URL용 ID
    userName: string; // 표시 이름(닉네임)
    email: string;
    password: string;
    passwordConfirm: string;
}

interface validateState {
    blogId: boolean;
    userName: boolean;
    email: boolean;
    password: boolean;
    passwordConfirm: boolean;
}

interface AvailabilityErrors {
    blogId: string;
    userName: string;
    email: string;
}

// 중복확인 로딩 상태 및 중복확인 여부 상태 타입
interface AvailabilityState {
    blogId: boolean;
    userName: boolean;
    email: boolean;
}

interface ThrottleErrors {
    blogId: string;
    userName: string;
    email: string;
}

function SignUpModal() {
    const [isClosing, setIsClosing] = useState<boolean>(false);

    // 폼 데이터 관련 상태

    const [formData, setFormData] = useState<SignUpFormData>({
        blogId: "", // URL용 ID
        userName: "", // 표시이름(닉네임)
        email: "",
        password: "",
        passwordConfirm: "",
    });

    const [formValidateErrors, setFormValidatorErrors] = useState<SignUpFormData>({
        blogId: "",
        userName: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 유효성 검사 전에, 사용자가 초기에 입력할때 중복확인 버튼이 잠깐 활성화 되는 현상 방지
    const [beforeValidate, setBeforeValidate] = useState<validateState>({
        blogId: true,
        userName: true,
        email: true,
        password: true,
        passwordConfirm: true
    });

    // 폼 데이터 관련 상태 끝

    // 중복 확인 관련 상태

    const [throttleErrors, setThrottleErrors] = useState<ThrottleErrors>({
        blogId: "",
        userName: "",
        email: "",
    });

    // 중복확인 버튼 클릭 시 중복확인 여부 상태
    const [isAvailabilityChecked, setIsAvailabilityChecked] = useState({
        blogId: false,
        userName: false,
        email: false,
    });

    const [isCheckingAvailabilityErrors, setIsCheckingAvailabilityErrors] = useState<AvailabilityErrors>({
        blogId: "",
        userName: "",
        email: "",
    });

    // 이메일 및 블로그 ID 중복 확인 중 로딩 상태
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState<AvailabilityState>({
        blogId: false,
        userName: false,
        email: false,
    });

    // 중복 확인 관련 상태 끝

    // 최종 회원 가입 관련
    const [errorMessageSignUpFromServer, setErrorMessageSignUpFromServer] = useState<string | null>(null);

    // 최종적으로 회원가입 버튼 클릭 시 로딩 상태
    const [isLoading, setIsLoading] = useState(false);
    // 최종 회원 가입 관련 상태 끝

    const { setShowLogin, setShowSignUp, setShowEmailVerification } = useAuthStore();

    // 중복확인은 서버 부하 방지를 위해 1분에 최대 3회 요청으로 제한
    const { canCheckAvailability, isBlocked } = useAvailabilityThrottle();

    // 폼 입력값이 시작되었는지 여부. 폼 입력이 시작되어야 유효성 검사를 시작한다.
    const [hasInteracted, setHasInteracted] = useState<Record<string, boolean>>({
        blogId: false,
        userName: false,
        email: false,
        password: false,
        passwordConfirm: false,
    });

    // 다음 입력 필드로 넘어갔을때 포커스 되어있는지 확인
    const [availabilityFocusWarning, setAvailabilityFocusWarning] = useState<AvailabilityState>({
        blogId: false,
        userName: false,
        email: false,
    });

    // 폼 데이터 디바운스 처리
    const [debouncedBlogId] = useDebounce(formData.blogId, 200);
    const [debouncedUserName] = useDebounce(formData.userName, 200);
    const [debouncedEmail] = useDebounce(formData.email, 200);
    const [debouncedPassword] = useDebounce(formData.password, 200);
    const [debouncedPasswordConfirm] = useDebounce(formData.passwordConfirm, 200);

    const validatePassword = (password: string) => {
        if (password.trim() === "") {
            return ["비밀번호를 입력해주세요"];
        }

        // 한글 체크
        if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(password)) {
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

    useEffect(() => {
        if (!hasInteracted.blogId) return;

        if (debouncedBlogId.trim() === "") {
            setFormValidatorErrors((prev) => ({ ...prev, blogId: "블로그의 고유 ID를 입력해주세요" }));
            return;
        }
        if (!/^[a-z0-9-_]{3,20}$/.test(debouncedBlogId)) {
            setFormValidatorErrors((prev) => ({ ...prev, blogId: "영문 소문자, 숫자, 하이픈, 언더스코어만 사용 가능합니다 (3-20자)" }));
            return;
        }
        setFormValidatorErrors((prev) => ({ ...prev, blogId: "" }));
        setBeforeValidate(prev => ({
            ...prev,
            blogId: false
        }));

    }, [debouncedBlogId]);

    useEffect(() => {
        if (!hasInteracted.userName) return;

        if (debouncedUserName.trim() === "") {
            setFormValidatorErrors((prev) => ({ ...prev, userName: "사용자명을 입력해주세요" }));
            return;
        }
        if (debouncedUserName.length < 2 || debouncedUserName.length > 10) {
            setFormValidatorErrors((prev) => ({ ...prev, userName: "사용자명은 2-10자 사이여야 합니다" }));
            return;
        }
        if (!/^[가-힣a-zA-Z0-9]+$/.test(debouncedUserName)) {
            setFormValidatorErrors((prev) => ({ ...prev, userName: "사용자명은 한글(자음, 모음 불가), 영문, 숫자만 사용 가능합니다" }));
            return;
        }
        setFormValidatorErrors((prev) => ({ ...prev, userName: "" }));
        setBeforeValidate(prev => ({
            ...prev,
            userName: false
        }));
    }, [debouncedUserName]);

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
        setBeforeValidate(prev => ({
            ...prev,
            email: false
        }));
    }, [debouncedEmail]);

    useEffect(() => {
        if (!hasInteracted.password) return;

        if (debouncedPassword.trim() === "") {
            setFormValidatorErrors((prev) => ({ ...prev, password: "패스워드를 입력해주세요" }));
            return;
        }

        const errors = validatePassword(debouncedPassword);
        if (errors.length > 0) {
            setFormValidatorErrors((prev) => ({ ...prev, password: errors.join(", ") }));
            return;
        }
        setFormValidatorErrors((prev) => ({ ...prev, password: "" }));
        setBeforeValidate(prev => ({
            ...prev,
            password: false
        }));
    }, [debouncedPassword]);

    useEffect(() => {
        if (!hasInteracted.passwordConfirm) return;

        if (debouncedPasswordConfirm.trim() === "") {
            setFormValidatorErrors((prev) => ({ ...prev, passwordConfirm: "패스워드를 재입력해주세요" }));
            return;
        }

        if (debouncedPasswordConfirm !== formData.password) {
            setFormValidatorErrors((prev) => ({ ...prev, passwordConfirm: "비밀번호가 일치하지 않습니다" }));
            return;
        }
        setFormValidatorErrors((prev) => ({ ...prev, passwordConfirm: "" }));
        setBeforeValidate(prev => ({
            ...prev,
            passwordConfirm: false
        }));
    }, [debouncedPasswordConfirm, formData.password]);

    const checkAvailability = async (field: AvailabilityField) => {
        // 중복확인 버튼 클릭 시 포커스 경고 초기화
        setAvailabilityFocusWarning((prev) => ({
            ...prev, 
            [field]: false
        }));

        if (!canCheckAvailability(field)) {
            // 새로운 에러 메시지 설정 및 타이머 시작
            setThrottleErrors((prev) => ({
                ...prev,
                [field]: "잠시 후에 다시 시도해주세요. (1분에 최대 3회까지 시도 가능합니다)",
            }));

            // 1분뒤에 에러 메시지 초기화
            setTimeout(() => {
                setThrottleErrors((prev) => ({
                    ...prev,
                    [field]: "",
                }));
            }, 60000);

            return false;
        }

        setIsAvailabilityLoading((prev) => ({ ...prev, [field]: true }));
        const configs: Record<AvailabilityField, AvailabilityConfig> = {
            blogId: {
                duplicateErrorMessage: "이미 사용 중인 블로그 ID 입니다",
                serverErrorMessage: "블로그 ID 확인 중 오류가 발생했습니다",
            },
            email: {
                duplicateErrorMessage: "이미 사용 중인 이메일입니다",
                serverErrorMessage: "이메일 확인 중 오류가 발생했습니다",
            },
            userName: {
                duplicateErrorMessage: "이미 사용 중인 사용자명입니다",
                serverErrorMessage: "사용자명 확인 중 오류가 발생했습니다",
            },
        };

        try {
            const apiCalls = {
                blogId: () => true,
                email: () => true,
                userName: () => true,
            };

            const isAvailable = await apiCalls[field]();

            if (!isAvailable) {
                setIsCheckingAvailabilityErrors((prev) => ({
                    ...prev,
                    [field]: configs[field].duplicateErrorMessage,
                }));
                return false;
            }
            
            setIsAvailabilityChecked((prev) => ({ ...prev, [field]: true }));
            console.log("중복확인 성공");


        } catch (error) {
            setIsCheckingAvailabilityErrors((prev) => ({
                ...prev,
                [field]: configs[field].serverErrorMessage,
            }));
            return false;
        } finally {
            setIsAvailabilityLoading((prev) => ({ ...prev, [field]: false }));
        }
    };

    // 모든 필드가 유효한지 확인. 모든 필드가 유효하다면 회원가입 버튼 활성화
    // 모든 필드가 유효한지 확인
    const isFormValid = (): boolean => {
        // 1. 모든 필드가 입력되었는지 확인
        const isAllFieldsFilled = Object.keys(formData).every((field) => formData[field as FormField].trim() !== "");

        // 2. 유효성 검증 에러가 없는지 확인
        const hasNoValidationErrors = Object.keys(formValidateErrors).every((field) => formValidateErrors[field as FormField] === "");

        // 3. 필수 중복확인이 완료되었는지 확인
        const isAllAvailabilityChecked = Object.keys(isAvailabilityChecked).every((field) => isAvailabilityChecked[field as AvailabilityField]);

        // 모든 유효성 검사가 끝난 후에야 회원가입 가능 
        const isAfterValidate = Object.keys(beforeValidate).every((field) => !beforeValidate[field as FormField]);
        console.log("isAllFieldsFilled", isAllFieldsFilled);    
        console.log("hasNoValidationErrors", hasNoValidationErrors);
        console.log("isAllAvailabilityChecked", isAllAvailabilityChecked);

        return isAllFieldsFilled && hasNoValidationErrors && isAllAvailabilityChecked && isAfterValidate;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        setHasInteracted((prev) => ({ ...prev, [name]: true }));

        setBeforeValidate(prev => ({
            ...prev,
            [name]: true
        }));

        // 사용자명 중복 확인을 해주세요 관련 경고 초기화
        setAvailabilityFocusWarning((prev) => ({ ...prev, [name]: false }));

        // 특정값을 입력한 후에 중복확인하고, 또 다시 입력 하면 중복 확인 체크 다시 해야함. 즉 값이 변경될때마다 중복확인을 다시 해야함
        if (name === "blogId" || name === "userName" || name === "email") { 
            setIsAvailabilityChecked((prev) => ({ ...prev, [name]: false }));
        }
    };

    const handleFieldFocus = (currentField: string) => {
        // 이전 포커스 경고 초기화
        // setFocusWarning({
        //     blogId: false,
        //     userName: false,
        //     email: false,
        // });

        // 중복확인 버튼을 누르지 않았을때 "중복 확인을 입력해주세요"메시지를 설정하기 위한 로직
        switch (currentField) {
            case "userName":
                // !beforeValidate.blogId는 폼 유효성 검사에 실패하면서 동시에 사용자명 필드에 포커스가 가게되면 폼 유효성 검사에 실패했는데도 "사용자명 중복확인을 입력해주세요"가 나오는 것을 방지
                // 즉 사용자명 필드에 포커스가 갔을 때 블로그 고유 ID 필드의 유효성 검사가 끝난 상태여야 그 안에 로직 실행
                if (!beforeValidate.blogId && !isAvailabilityChecked.blogId && formData.blogId.trim() !== "" && !formValidateErrors.blogId) {
                    setAvailabilityFocusWarning((prev) => ({ ...prev, blogId: true }));
                }
                break;
            case "email":
                if (!beforeValidate.userName && !isAvailabilityChecked.userName && formData.userName.trim() !== "" && !formValidateErrors.userName) {
                    setAvailabilityFocusWarning((prev) => ({ ...prev, userName: true }));
                }
                break;
            case "password":
                if (!beforeValidate.email && !isAvailabilityChecked.email && formData.email.trim() !== "" && !formValidateErrors.email) {
                    setAvailabilityFocusWarning((prev) => ({ ...prev, email: true }));
                }
                break;
        }
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            // 비밀번호 재확인은 빼고 서버측으로 전송
            const { passwordConfirm, ...signupPayload } = formData;

            // const response = await signupUser(signupPayload);
            // console.log("회원가입 성공 SignUp Page", response);

            setIsClosing(true);
            setTimeout(() => {
                setShowSignUp(false);
                setShowEmailVerification(true);
            }, 300);
        } catch (error: any) {
            console.log("회원가입 실패 SignUp Page: ", error);
            // setErrorMessageSignUpFromServer(error.message);
            setErrorMessageSignUpFromServer("회원가입 중 오류가 발생했습니다");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
    };

    // 블로그ID, Email, UserName 중복확인 버튼 비활성화 여부 함수
    const isFieldDisabled = (field: AvailabilityField): boolean => {
        return formData[field].trim() === "" || isAvailabilityLoading[field] || !(formValidateErrors[field] === "")
            ? true
            : false || isBlocked[field] || beforeValidate[field];
    };

    const isBlogIdButtonDisabled = isFieldDisabled("blogId");
    const isUserNameButtonDisabled = isFieldDisabled("userName");
    const isEmailButtonDisabled = isFieldDisabled("email");

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black bg-opacity-30'>
            <AnimatePresence
                mode='wait'
                onExitComplete={() => {
                    setShowSignUp(false);
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
                            stiffness: 700, // 높일수록 더 빠름
                            damping: 70, // 높일수록 덜 튕김
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
                                            name='blogId'
                                            type='text'
                                            value={formData.blogId}
                                            onChange={handleChange}
                                            className='flex-1 p-2 border rounded'
                                            placeholder='영문 소문자, 숫자, 하이픈, 언더스코어만 사용가능 (3-20자)'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => checkAvailability("blogId")}
                                            disabled={isBlogIdButtonDisabled}
                                            className={`${
                                                isBlogIdButtonDisabled
                                                    ? "cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200"
                                                    : "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800"
                                            } rounded-lg px-4 py-2 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                        >
                                            {isAvailabilityLoading.blogId ? "확인중..." : "중복확인"}
                                        </button>
                                    </div>
                                    {formValidateErrors.blogId && <p className='text-red-500 text-sm mt-1'>{formValidateErrors.blogId}</p>}

                                    {isCheckingAvailabilityErrors.blogId && (
                                        <p className='text-red-500 text-sm mt-1'>{isCheckingAvailabilityErrors.blogId}</p>
                                    )}
                                    {throttleErrors.blogId && <div className='text-red-500 text-sm mt-2'>{throttleErrors.blogId}</div>}

                                    {availabilityFocusWarning.blogId && <p className='text-red-500 text-sm mt-2'>블로그 아이디 중복 확인을 해주세요</p>}
                                </div>

                                {/* 사용자명 입력 */}
                                <div>
                                    <label className='block text-sm font-medium mb-1'>
                                        사용자명 <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='flex gap-2'>
                                        <input
                                            name='userName'
                                            type='text'
                                            value={formData.userName}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus("userName")}
                                            className='flex-1 p-2 border rounded'
                                            placeholder='한글(자음, 모음 불가), 영문, 숫자만 사용 가능 (2-10자)'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => checkAvailability("userName")}
                                            disabled={isUserNameButtonDisabled}
                                            className={`${
                                                isUserNameButtonDisabled
                                                    ? "cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200"
                                                    : "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800"
                                            } rounded-lg px-4 py-2 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                        >
                                            {isAvailabilityLoading.userName ? "확인중..." : "중복확인"}
                                        </button>
                                    </div>
                                    {/*  폼 벨리데이션 에러 처리 메시지 */}
                                    {formValidateErrors.userName && <p className='text-red-500 text-sm mt-1'>{formValidateErrors.userName}</p>}

                                    {/* 서버측으로 받은 중복확인 처리 에러 메시지 */}
                                    {isCheckingAvailabilityErrors.userName && (
                                        <p className='text-red-500 text-sm mt-1'>{isCheckingAvailabilityErrors.userName}</p>
                                    )}

                                    {/* 중복확인 버튼 너무 3회 초과 클릭 시 에러 메시지 */}
                                    {throttleErrors.userName && <div className='text-red-500 text-sm mt-2'>{throttleErrors.userName}</div>}

                                    {/* 중복확인을 하지 않았을시에 경고  */}
                                    {availabilityFocusWarning.userName && <p className='text-red-500 text-sm mt-2'>사용자명 중복 확인을 해주세요</p>}
                                </div>

                                {/* 이메일 입력  */}
                                <div>
                                    <label className='block text-sm font-medium mb-1'>
                                        이메일 <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='flex gap-2'>
                                        <input
                                            name='email'
                                            type='email'
                                            value={formData.email}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus("email")}
                                            className='flex-1 p-2 border rounded'
                                            placeholder='example@email.com'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => checkAvailability("email")}
                                            disabled={isEmailButtonDisabled}
                                            className={`${
                                                isEmailButtonDisabled
                                                    ? "cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200"
                                                    : "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800"
                                            } rounded-lg px-4 py-2 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                        >
                                            {isAvailabilityLoading.email ? "확인중..." : "중복확인"}
                                        </button>
                                    </div>

                                    {formValidateErrors.email && <p className='text-red-500 text-sm mt-1'>{formValidateErrors.email}</p>}
                                    {isCheckingAvailabilityErrors.email && (
                                        <p className='text-red-500 text-sm mt-1'>{isCheckingAvailabilityErrors.email}</p>
                                    )}

                                    {throttleErrors.email && <div className='text-red-500 text-sm mt-2'>{throttleErrors.email}</div>}

                                    {availabilityFocusWarning.email && <p className='text-red-500 text-sm mt-2'>이메일 중복 확인을 해주세요</p>}
                                </div>

                                {/* 비밀번호 입력  */}
                                <div>
                                    <label className='block text-sm font-medium mb-1'>
                                        비밀번호 <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='relative'>
                                        <input
                                            name='password'
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus("password")}
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
                                    {formValidateErrors.password && <p className='text-red-500 text-sm mt-1'>{formValidateErrors.password}</p>}
                                </div>

                                {/* 비밀번호 재확인  */}
                                <div>
                                    <label className='block text-sm font-medium mb-1'>
                                        비밀번호 확인 <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='relative'>
                                        <input
                                            name='passwordConfirm'
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.passwordConfirm}
                                            onChange={handleChange}
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
                                    {formValidateErrors.passwordConfirm && (
                                        <p className='text-red-500 text-sm mt-1'>{formValidateErrors.passwordConfirm}</p>
                                    )}
                                </div>
                                {/* ? "cursor-pointer shadow-md  bg-[#333] text-white hover:bg-[#505050] hover:shadow-md transition-all"
                                    : "cursor-not-allowed bg-white text-gray-400 border-2 border-manageBgColor" */}
                                <button
                                    type='submit'
                                    className={`w-full py-2 mt-2 rounded-lg transition-all duration-200 ${
                                        isFormValid() ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                    disabled={!isFormValid() || isLoading}
                                >
                                    {isLoading ? "처리중..." : "회원가입"}
                                </button>

                                {errorMessageSignUpFromServer && <p className='text-sm text-red-500 mb-4'>{errorMessageSignUpFromServer}</p>}
                            </form>

                            <div className='text-center mt-6'>
                                <p className='text-sm text-gray-600'>
                                    계정이 이미 있으신가요?{" "}
                                    <a
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsClosing(true); // 종료 애니메이션 효과 시작
                                            // 종료 애니메이션 효과가 끝나고 시작
                                            setTimeout(() => {
                                                setShowSignUp(false);
                                                setShowLogin(true);
                                            }, 300);
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
    );
}

export default SignUpModal;
