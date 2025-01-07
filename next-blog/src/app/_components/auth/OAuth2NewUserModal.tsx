"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { checkAvailabilityRequest, signupOAuth2User } from "@/services/api";
import { useDebounce } from "use-debounce";
import { useAuthStore } from "@/store/appStore";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

// 폼 필드 타입 정의
type FormField = "blogId" | "username";
type AvailabilityField = "blogId" | "username";

interface SignUpFormData {
    blogId: string; // URL용 ID
    username: string; // 표시 이름(닉네임)
}

interface validateState {
    blogId: boolean;
    username: boolean;
}

interface AvailabilityErrors {
    blogId: string;
    username: string;
}

// 중복확인 로딩 상태 및 중복확인 여부 상태 타입
interface AvailabilityState {
    blogId: boolean;
    username: boolean;
}

function OAuth2NewUserModal() {
    const [isClosing, setIsClosing] = useState<boolean>(false);

    // 폼 데이터 관련 상태

    const [formData, setFormData] = useState<SignUpFormData>({
        blogId: "", // URL용 ID
        username: "", // 표시이름(닉네임)
    });

    const [formValidateErrors, setFormValidatorErrors] = useState<SignUpFormData>({
        blogId: "",
        username: "",
    });

    // 유효성 검사 전에, 사용자가 초기에 입력할때 중복확인 버튼이 잠깐 활성화 되는 현상 방지
    const [beforeValidate, setBeforeValidate] = useState<validateState>({
        blogId: true,
        username: true,
    });

    // 폼 데이터 관련 상태 끝

    // 중복 확인 관련 상태

    // 중복확인 버튼 클릭 시 중복확인 여부 상태
    const [isAvailabilityChecked, setIsAvailabilityChecked] = useState({
        blogId: false,
        username: false,
    });

    const [rateLimitErrors, setRateLimitErrors] = useState<AvailabilityErrors>({
        blogId: "",
        username: "",
    });

    const [duplicateCheckErrors, setDuplicateCheckErrors] = useState<AvailabilityErrors>({
        blogId: "",
        username: "",
    });
    // 이메일 및 블로그 ID 중복 확인 중 로딩 상태
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState<AvailabilityState>({
        blogId: false,
        username: false,
    });

    // 중복 확인 관련 상태 끝

    // 최종 회원 가입 관련
    const [errorMessageSignUpFromServer, setErrorMessageSignUpFromServer] = useState<string | null>(null);
    const [rateLimitErrorsFromServer, setRateLimitErrorsFromServer] = useState<string>("");

    // 최종적으로 회원가입 버튼 클릭 시 로딩 상태
    const [isLoading, setIsLoading] = useState(false);
    // 최종 회원 가입 관련 상태 끝

    const { setShowLogin, setShowOAuth2NewUserModal, setTempOAuth2UserUniqueId, tempOAuth2UserUniqueId, setOAuth2Redirect } = useAuthStore();

    // 폼 입력값이 시작되었는지 여부. 폼 입력이 시작되어야 유효성 검사를 시작한다.
    const [hasInteracted, setHasInteracted] = useState<Record<string, boolean>>({
        blogId: false,
        username: false,
    });

    // 다음 입력 필드로 넘어갔을때 포커스 되어있는지 확인
    const [availabilityFocusWarning, setAvailabilityFocusWarning] = useState<AvailabilityState>({
        blogId: false,
        username: false,
    });

    // 폼 데이터 디바운스 처리
    const [debouncedBlogId] = useDebounce(formData.blogId, 200);
    const [debouncedUsername] = useDebounce(formData.username, 200);

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
        setBeforeValidate((prev) => ({
            ...prev,
            blogId: false,
        }));
    }, [debouncedBlogId]);

    useEffect(() => {
        if (!hasInteracted.username) return;

        if (debouncedUsername.trim() === "") {
            setFormValidatorErrors((prev) => ({ ...prev, username: "사용자명을 입력해주세요" }));
            return;
        }
        if (debouncedUsername.length < 2 || debouncedUsername.length > 10) {
            setFormValidatorErrors((prev) => ({ ...prev, username: "사용자명은 2-10자 사이여야 합니다" }));
            return;
        }
        if (!/^[가-힣a-zA-Z0-9]+$/.test(debouncedUsername)) {
            setFormValidatorErrors((prev) => ({ ...prev, username: "사용자명은 한글(자음, 모음 불가), 영문, 숫자만 사용 가능합니다" }));
            return;
        }
        setFormValidatorErrors((prev) => ({ ...prev, username: "" }));
        setBeforeValidate((prev) => ({
            ...prev,
            username: false,
        }));
    }, [debouncedUsername]);

    const checkAvailability = async (field: AvailabilityField) => {
        console.log("checkAvailabilit실행dddd");

        // 중복확인 버튼 클릭 시 포커스 경고 초기화
        setAvailabilityFocusWarning((prev) => ({
            ...prev,
            [field]: false,
        }));

        setIsAvailabilityLoading((prev) => ({ ...prev, [field]: true }));

        try {
            const apiCalls = {
                blogId: (value: string) => checkAvailabilityRequest.blogId(value),
                username: (value: string) => checkAvailabilityRequest.username(value),
            };

            const response = await apiCalls[field](formData[field]); // 여기서 실패하면 catch문 실행

            if (response.status === 200) {
                console.log("response", response);

                setIsAvailabilityChecked((prev) => ({ ...prev, [field]: true }));
            }
        } catch (error: unknown) {
            if (error instanceof CustomHttpError) {
                if (error.status === 429) {
                    setRateLimitErrors((prev) => ({
                        ...prev,
                        [field]: error.message,
                    }));

                    setTimeout(() => {
                        setRateLimitErrors((prev) => ({
                            ...prev,
                            [field]: "",
                        }));
                    }, 60000);
                } else if (error.status === 409) {
                    setDuplicateCheckErrors((prev) => ({
                        ...prev,
                        [field]: error.message,
                    }));
                }
            }

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

        return isAllFieldsFilled && hasNoValidationErrors && isAllAvailabilityChecked && isAfterValidate;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        setHasInteracted((prev) => ({ ...prev, [name]: true }));

        setBeforeValidate((prev) => ({
            ...prev,
            [name]: true,
        }));

        // 사용자명 중복 확인을 해주세요 관련 경고 초기화
        setAvailabilityFocusWarning((prev) => ({ ...prev, [name]: false }));

        // 특정값을 입력한 후에 중복확인하고, 또 다시 입력 하면 중복 확인 체크 다시 해야함. 즉 값이 변경될때마다 중복확인을 다시 해야함
        if (name === "blogId" || name === "username" || name === "email") {
            setIsAvailabilityChecked((prev) => ({ ...prev, [name]: false }));
            setDuplicateCheckErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFieldFocus = (currentField: string) => {
        // 이전 포커스 경고 초기화
        // setFocusWarning({
        //     blogId: false,
        //     username: false,
        //     email: false,
        // });

        // 중복확인 버튼을 누르지 않았을때 "중복 확인을 입력해주세요"메시지를 설정하기 위한 로직
        switch (currentField) {
            case "username":
                // !beforeValidate.blogId는 폼 유효성 검사에 실패하면서 동시에 사용자명 필드에 포커스가 가게되면 폼 유효성 검사에 실패했는데도 "사용자명 중복확인을 입력해주세요"가 나오는 것을 방지
                // 즉 사용자명 필드에 포커스가 갔을 때 블로그 고유 ID 필드의 유효성 검사가 끝난 상태여야 그 안에 로직 실행
                if (!beforeValidate.blogId && !isAvailabilityChecked.blogId && formData.blogId.trim() !== "" && !formValidateErrors.blogId) {
                    setAvailabilityFocusWarning((prev) => ({ ...prev, blogId: true }));
                }
                break;
            case "email":
                if (!beforeValidate.username && !isAvailabilityChecked.username && formData.username.trim() !== "" && !formValidateErrors.username) {
                    setAvailabilityFocusWarning((prev) => ({ ...prev, username: true }));
                }
                break;
        }
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {

        console.log("tempOAuth2UserUniqueId>>>", tempOAuth2UserUniqueId);

        e.preventDefault();

        setIsLoading(true);

        try {
            // const response = await signupOAuth2User(formData);
            await signupOAuth2User(formData, tempOAuth2UserUniqueId);

            setTempOAuth2UserUniqueId("");

            setIsClosing(true);
            setTimeout(() => {
                setShowOAuth2NewUserModal(false);
            }, 300);

            setTimeout(() => {
                toast.success(
                    <span>
                        {/* OAuth2 신규 사용자 등록에 성공하였습니다. 응답보다 로그인에 성공하였습니다. 응답이 좋은것 같아서 주석처리
                         <span style={{ fontSize: "0.7rem" }}>{response.message}</span>  */}
                        <span style={{ fontSize: "0.8rem", whiteSpace: "pre-line" }}>
                            가입이 완료되었습니다.<br />
                            블로그를 시작해보세요! ✨
                        </span>
                    </span>,
                    {
                        autoClose: 2000,
                        onClose: () => {
                            // AuthProvider에서 OAuth2 신규 사용자 액세스 토큰 발급을 위해 필요
                            sessionStorage.setItem("OAuth2NewUserIsRegistered", "true");
                            setOAuth2Redirect(true);
                            // window.location.reload();
                        },
                    }
                );
            }, 350);
        } catch (error: unknown) {
            if (error instanceof CustomHttpError) {
                if (error.status === 429) {
                    setRateLimitErrorsFromServer(error.message);
                    setTimeout(() => {
                        setRateLimitErrorsFromServer("");
                    }, 60000);
                } else {
                    console.log("OAuth2 회원가입 실패 SignUp Page: ", error);

                    // 서버에서 받은 메시지인 "OAuth2 신규 사용자 등록에 실패하였습니다." 응답보다 아래 응답이 좋은것 같아서 주석처리
                    //   setErrorMessageSignUpFromServer(error.message);
                    setErrorMessageSignUpFromServer("가입이 실패하였습니다. 잠시후 다시 시도해주세요.");
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setTempOAuth2UserUniqueId("");
        setIsClosing(true);
    };

    // 블로그ID, Email, username 중복확인 버튼 비활성화 여부 함수
    const isFieldDisabled = (field: AvailabilityField): boolean => {
        return (
            formData[field].trim() === "" ||
            isAvailabilityLoading[field] ||
            !(formValidateErrors[field] === "") ||
            !(rateLimitErrors[field] === "") ||
            !(duplicateCheckErrors[field] === "") ||
            isAvailabilityChecked[field] ||
            beforeValidate[field]
        );
    };

    const isBlogIdButtonDisabled = isFieldDisabled("blogId");
    const isUsernameButtonDisabled = isFieldDisabled("username");

    return (
        <div className='fixed inset-0 z-[1500] flex items-center justify-center overflow-hidden bg-black bg-opacity-30'>
            <AnimatePresence
                mode='wait'
                onExitComplete={() => {
                    setShowOAuth2NewUserModal(false);
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
                                <h2 className='text-xl font-bold text-gray-800'>블로그 고유ID 및 사용자명(닉네임) 추가 입력</h2>
                                <button className='text-gray-600 hover:text-black' onClick={handleCloseModal}>
                                    닫기
                                </button>
                            </div>

                            {/* w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 */}

                            <p className='text-gray-600 text-sm mb-4'>1시간 이내에 등록 완료해야 합니다.</p>
                            <form onSubmit={handleSignUp}>
                                {/* 블로그 ID 입력 */}
                                <div>
                                    <label className='block text-sm font-medium mb-1'>
                                        블로그 고유 ID(고유 주소) <span className='text-red-500'>*</span>
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
                                            {isAvailabilityLoading.blogId ? (
                                                "확인중..."
                                            ) : isAvailabilityChecked.blogId ? (
                                                <FaCheck size={16} />
                                            ) : (
                                                "중복확인"
                                            )}
                                        </button>
                                    </div>
                                    {formValidateErrors.blogId && <p className='text-red-500 text-sm mt-1'>{formValidateErrors.blogId}</p>}

                                    {rateLimitErrors.blogId && <p className='text-red-500 text-sm mt-1'>{rateLimitErrors.blogId}</p>}

                                    {duplicateCheckErrors.blogId && <p className='text-red-500 text-sm mt-1'>{duplicateCheckErrors.blogId}</p>}

                                    {availabilityFocusWarning.blogId && (
                                        <p className='text-red-500 text-sm mt-2'>블로그 아이디 중복 확인을 해주세요</p>
                                    )}
                                </div>

                                {/* 사용자명 입력 */}
                                <div>
                                    <label className='block text-sm font-medium mb-1'>
                                        사용자명(닉네임) <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='flex gap-2'>
                                        <input
                                            name='username'
                                            type='text'
                                            value={formData.username}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus("username")}
                                            className='flex-1 p-2 border rounded'
                                            placeholder='한글(자음, 모음 불가), 영문, 숫자만 사용 가능 (2-10자)'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => checkAvailability("username")}
                                            disabled={isUsernameButtonDisabled}
                                            className={`${
                                                isUsernameButtonDisabled
                                                    ? "cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200"
                                                    : "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800"
                                            } rounded-lg px-4 py-2 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                        >
                                            {isAvailabilityLoading.username ? (
                                                "확인중..."
                                            ) : isAvailabilityChecked.username ? (
                                                <FaCheck size={16} />
                                            ) : (
                                                "중복확인"
                                            )}
                                        </button>
                                    </div>
                                    {/*  폼 벨리데이션 에러 처리 메시지 */}
                                    {formValidateErrors.username && <p className='text-red-500 text-sm mt-1'>{formValidateErrors.username}</p>}

                                    {/* 서버측으로 받은 중복확인 처리 횟수 초과 에러 메시지 */}
                                    {rateLimitErrors.username && <p className='text-red-500 text-sm mt-1'>{rateLimitErrors.username}</p>}
                                    {/* 서버측으로 받은 이미 존재하는 경우의 에러 메시지 */}
                                    {duplicateCheckErrors.username && <p className='text-red-500 text-sm mt-1'>{duplicateCheckErrors.username}</p>}

                                    {/* 중복확인을 하지 않았을시에 경고  */}
                                    {availabilityFocusWarning.username && <p className='text-red-500 text-sm mt-2'>사용자명 중복 확인을 해주세요</p>}
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
                                    {isLoading ? "처리중..." : "등록"}
                                </button>

                                {errorMessageSignUpFromServer && <p className='text-sm text-red-500 mb-4'>{errorMessageSignUpFromServer}</p>}
                                {rateLimitErrorsFromServer && <p className='text-sm text-red-500 mb-4'>{rateLimitErrorsFromServer}</p>}
                            </form>

                            {/* <div className='text-center mt-6'>
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
                            </div> */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default OAuth2NewUserModal;
