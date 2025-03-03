"use client";

import { FaPlus } from "react-icons/fa6";
import NextImage from "next/image";
import React, { useEffect, useRef, useState } from "react";
import CommonSideNavigation from "@/app/_components/layout/sidebar/CommonSideNavigation";
import { useDebounce } from "use-debounce";
import { userProfileStore } from "@/store/appStore";
import { ClipLoader } from "react-spinners";
import useUpdateProfile from "@/customHooks/useUpdateProfile";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";
import { revalidateUserProfile } from "@/actions/revalidate";
import ToastProvider from "@/providers/ToastProvider";

const UserManage = () => {
    const { profileImage, blogName, blogId, blogUsername, defaultProfileImage } = userProfileStore();
    const [updateProfileImage, setUpdateProfileImage] = useState<string>(profileImage);
    const [updateBlogName, setUpdateBlogName] = useState<string>(blogName);
    const [updateBlogUsername, setUpdateBlogUsername] = useState<string>(blogUsername);

    const imageFileRef = useRef<File | null>(null);

    const [hasInteracted, setHasInteracted] = useState({
        blogName: false,
        username: false,
    });
    const [formValidatorErrors, setFormValidatorErrors] = useState({
        blogName: "",
        username: "",
    });

    const { setProfileUpdate } = userProfileStore();

    const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [debouncedBlogName] = useDebounce(updateBlogName, 300);
    const [debouncedUsername] = useDebounce(updateBlogUsername, 300);

    const updateProfileMutation = useUpdateProfile();

    useEffect(() => {
        if (!hasInteracted.blogName) return;

        if (debouncedBlogName.trim() === "") {
            setFormValidatorErrors((prev) => ({ ...prev, blogName: "블로그 이름을 입력해주세요" }));
            return;
        }
        if (debouncedBlogName.length > 32) {
            setFormValidatorErrors((prev) => ({ ...prev, blogName: "블로그 이름은 32자 이하여야 합니다" }));
            return;
        }
        setFormValidatorErrors((prev) => ({ ...prev, blogName: "" }));
    }, [debouncedBlogName]);

    useEffect(() => {
        if (!hasInteracted.username) return;

        if (debouncedUsername.trim() === "") {
            setFormValidatorErrors((prev) => ({ ...prev, username: "닉네임을 입력해주세요" }));
            return;
        }
        if (debouncedUsername.length < 2 || debouncedUsername.length > 10) {
            setFormValidatorErrors((prev) => ({ ...prev, username: "닉네임은 2-10자 사이여야 합니다" }));
            return;
        }
        if (!/^[가-힣a-zA-Z0-9]+$/.test(debouncedUsername)) {
            setFormValidatorErrors((prev) => ({ ...prev, username: "닉네임은 한글(자음, 모음 불가), 영문, 숫자만 사용 가능합니다" }));
            return;
        }
        setFormValidatorErrors((prev) => ({ ...prev, username: "" }));
    }, [debouncedUsername]);

    useEffect(() => {
        // 새로운 useEffect가 실행되기전에 이전 클린업 함수 먼저 실행
        return () => {
            if (updateProfileImage.startsWith("blob:")) {
                URL.revokeObjectURL(updateProfileImage);
            }
        };
    }, [updateProfileImage]);

    const isFormValid = () => {
        // 하나라도 수정됐는지 체크(기존값과 동일하면 요청x)
        const isModified = updateBlogName !== blogName || updateBlogUsername !== blogUsername || updateProfileImage !== profileImage;

        // 유효성 검사 통과 확인
        const isValid =
            updateBlogName.trim() !== "" &&
            updateBlogUsername.trim() !== "" &&
            formValidatorErrors.blogName === "" &&
            formValidatorErrors.username === "";

        return isModified && isValid;
    };

    const setInitialize = () => {
        setUpdateSuccess(false);
        setIsLoading(false);
    };

    const handleBlogNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdateBlogName(e.target.value);
        setHasInteracted((prev) => ({ ...prev, blogName: true }));
        setInitialize();
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdateBlogUsername(e.target.value);
        setHasInteracted((prev) => ({ ...prev, username: true }));
        setInitialize();
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            imageFileRef.current = file;
            const localPreviewUrl = URL.createObjectURL(file);
            setUpdateProfileImage(localPreviewUrl);
        }

        setInitialize();
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            const access_token = localStorage.getItem("access_token") as string;

            const formData = new FormData();

            if (imageFileRef.current) {
                formData.append("profileImage", imageFileRef.current);
            }

            formData.append("blogName", updateBlogName);
            formData.append("username", updateBlogUsername);

            const updateProfileParams = {
                token: access_token,
                blogId,
                formData,
            };

            const onSuccess = async () => {
                await revalidateUserProfile();
                setUpdateSuccess(true);
                setProfileUpdate(true); // CommonHeader에서 개인 private 사용자 정보를 다시 불러오기 위해
            };

            const onError = (error: unknown) => {
                setUpdateSuccess(false);

                if (error instanceof CustomHttpError) {
                    if (error.status === 401) {
                        localStorage.removeItem("access_token");
                        toast.error(
                            <span style={{ whiteSpace: "pre-line" }}>
                                <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                            </span>,
                            {
                                onClose: () => {
                                    window.location.reload();
                                },
                            }
                        );
                    } else {
                        toast.error(
                            <span style={{ whiteSpace: "pre-line" }}>
                                <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                            </span>,
                            {
                                onClose: () => {},
                            }
                        );
                    }
                } else {
                    console.error("프로필 업데이트에 실패하였습니다. Unknown Error");
                }
            };

            // 나중에 blogId도 바꿀 수 있으면 blogId 체크하는 users-${blogId}-checks 태그 무효화 필요
            await updateProfileMutation.mutate(updateProfileParams, { onSuccess, onError });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteImage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        imageFileRef.current = null;
        setUpdateProfileImage(defaultProfileImage);
        setInitialize();
    };

    //컨텐츠 부분 전체 문서에 수평, 수직 정렬을 위해 profile-wrapper 사용

    return (
        <>
            <ToastProvider />
            <div className='manage-wrapper min-h-screen w-full bg-gray-100 flex items-center justify-center'>
                <CommonSideNavigation />
                <section className='flex flex-col justify-end container lg:max-w-screen-lg pt-10 bg-white rounded-lg shadow-lg h-[41rem] mt-[5rem] ml-[16rem] relative'>
                    {/* 오른쪽 설정 섹션 */}
                    <div aria-label='블로그 설정'>
                        <h2 className='text-2xl font-bold mb-8 text-gray-800 flex justify-center'>블로그 관리</h2>

                        <form className='space-y-4 max-w-2xl mx-auto'>
                            <div className='mx-auto h-44 w-44 relative group'>
                                <button
                                    className='absolute right-0 top-0 w-8 h-8 bg-gray-800 hover:bg-gray-700 flex items-center justify-center z-10 cursor-pointer'
                                    onClick={handleDeleteImage}
                                >
                                    <span className='text-white text-xl font-medium'>-</span>
                                </button>
                                <NextImage
                                    width={160}
                                    height={160}
                                    src={updateProfileImage}
                                    alt='사용자 프로필 이미지'
                                    priority={true}
                                    className='h-full w-full object-cover transition-opacity'
                                />

                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <label
                                        htmlFor='profileImageInput'
                                        className='flex items-center justify-center h-12 w-12 bg-gray-800 hover:bg-gray-700 rounded-full cursor-pointer transition-colors duration-200'
                                    >
                                        <FaPlus className='text-white text-xl' />
                                    </label>
                                </div>
                                <input id='profileImageInput' type='file' onChange={handleImageUpload} className='hidden' accept='image/*' />
                            </div>

                            <div>
                                <label htmlFor='blogId' className='block text-sm font-medium text-gray-700 mb-1'>
                                    블로그 주소
                                </label>
                                <input
                                    id='blogId'
                                    type='text'
                                    value={blogId}
                                    readOnly
                                    // onChange={(e) => setPrivateBlogId(e.target.value)}
                                    className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed outline-none'
                                />
                            </div>

                            <div>
                                <label htmlFor='blogName' className='block text-sm font-medium text-gray-700 mb-1'>
                                    블로그 이름
                                </label>
                                <input
                                    id='blogName'
                                    type='text'
                                    value={updateBlogName}
                                    onChange={handleBlogNameChange}
                                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm  outline-none'
                                />

                                {formValidatorErrors.blogName && <p className='text-red-500 text-sm mt-1'>{formValidatorErrors.blogName}</p>}
                            </div>

                            <div>
                                <label htmlFor='blogNickName' className='block text-sm font-medium text-gray-700 mb-1'>
                                    블로그 닉네임
                                </label>
                                <input
                                    id='blogNickName'
                                    type='text'
                                    value={updateBlogUsername}
                                    onChange={handleUsernameChange}
                                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm  outline-none'
                                />
                                {formValidatorErrors.username && <p className='text-red-500 text-sm mt-1'>{formValidatorErrors.username}</p>}
                            </div>
                        </form>
                    </div>
                    <div className='min-h-[85px] px-8 py-5 flex justify-end mt-6 bg-[#FAFBFC]'>
                        <button
                            type='submit'
                            disabled={!isFormValid() || updateSuccess || isLoading}
                            className={`w-[9rem] font-medium text-sm px-4 py-2 ${
                                !isFormValid() || updateSuccess
                                    ? "cursor-not-allowed bg-white text-gray-400 border-2 border-manageBgColor"
                                    : "cursor-pointer shadow-md  bg-gray-800 text-white hover:bg-gray-700 hover:shadow-md transition-all"
                            }`}
                            onClick={handleSave}
                        >
                            {isLoading ? <ClipLoader color='#ffffff' size={20} /> : updateSuccess ? "저장 완료" : "변경사항 저장"}
                        </button>
                    </div>
                </section>
                {/* 저장 버튼 absolute bottom-[28px] right-[176px]*/}
            </div>
        </>
    );
};

export default UserManage;
