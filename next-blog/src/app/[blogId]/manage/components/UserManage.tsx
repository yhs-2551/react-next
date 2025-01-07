"use client";

import { CiCirclePlus } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import NextImage from "next/image";
import React, { useEffect, useState } from "react";
import CommonSideNavigation from "@/app/_components/layout/sidebar/CommonSideNavigation";
import { uploadFile } from "@/services/api";
import { useDebounce } from "use-debounce";
import { updateProfile } from "@/actions/user-actions";
import { userProfileStore } from "@/store/appStore";

const UserManage = () => {
    const { profileImage, blogName, blogId, blogUsername } = userProfileStore();
    const [updateProfileImage, setUpdateProfileImage] = useState<string>(profileImage);
    const [updateBlogName, setUpdateBlogName] = useState<string>(blogName);
    const [updateBlogUsername, setUpdateBlogUsername] = useState<string>(blogUsername);

    const [hasInteracted, setHasInteracted] = useState({
        blogName: false,
        username: false,
    });
    const [formValidatorErrors, setFormValidatorErrors] = useState({
        blogName: "",
        username: "",
    });

    const [debouncedBlogName] = useDebounce(updateBlogName, 300);
    const [debouncedUsername] = useDebounce(updateBlogUsername, 300);

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

    const isFormValid = () => {
        // 하나라도 수정됐는지 체크(기존값과 동일하면 요청x)
        const isModified =
            updateBlogName !== blogName || updateBlogUsername !== blogUsername || updateProfileImage !== profileImage;

        // 유효성 검사 통과 확인
        const isValid =
            updateBlogName.trim() !== "" &&
            updateBlogUsername.trim() !== "" &&
            formValidatorErrors.blogName === "" &&
            formValidatorErrors.username === "";

        return isModified && isValid;
    };

    const handleBlogNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdateBlogName(e.target.value);
        setHasInteracted((prev) => ({ ...prev, blogName: true }));
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdateBlogUsername(e.target.value);
        setHasInteracted((prev) => ({ ...prev, username: true }));
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // const imageUrl = await uploadFile(file, blogId, "profile");
            // // setProfileImage(imageUrl); // 업로드된 이미지를 전역 상태로 관리
            // setTempProfileImage(imageUrl);
            const localPreviewUrl = URL.createObjectURL(file);
            setUpdateProfileImage(localPreviewUrl);
        }
    };

    const handleSave = () => {
        const access_token = localStorage.getItem("access_token") as string;

        const profileData = {
            blogName: updateBlogName,
            blogUsername: updateBlogUsername,
            profileImageUrl: updateProfileImage,
        };

        const response = updateProfile(access_token, blogId, profileData);
    };

    return (
        // 컨텐츠 부분 전체 문서에 수평, 수직 정렬을 위해 profile-wrapper 사용
        <div className='manage-wrapper min-h-screen w-full bg-gray-100 flex items-center justify-center'>
            <CommonSideNavigation />

            <section className='flex flex-col justify-end container lg:max-w-screen-lg pt-10 bg-white rounded-lg shadow-lg h-[41rem] mt-[5rem] ml-[16rem] relative'>
                {/* 오른쪽 설정 섹션 */}
                <div aria-label='블로그 설정'>
                    <h2 className='text-2xl font-bold mb-8 text-gray-800 flex justify-center'>블로그 관리</h2>

                    <form className='space-y-4 max-w-2xl mx-auto'>
                        <div className='mx-auto h-40 w-40 relative group'>
                            <NextImage
                                width={160}
                                height={160}
                                src={updateProfileImage}
                                alt='사용자 프로필 이미지'
                                priority={true}
                                className='h-full w-full object-cover rounded-full transition-opacity'
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
                <div className='px-8 py-5 flex justify-end mt-6 bg-[#FAFBFC]'>
                    <button
                        type='submit'
                        disabled={!isFormValid()}
                        className={`w-[9rem] font-medium text-sm px-4 py-2 ${
                            isFormValid()
                                ? "cursor-pointer shadow-md bg-gray-800 text-white hover:bg-gray-700 hover:shadow-md transition-all"
                                : "cursor-not-allowed bg-white text-gray-400 border-2 border-manageBgColor"
                        }`}
                        onClick={handleSave}
                    >
                        변경사항 저장
                    </button>
                </div>
            </section>
            {/* 저장 버튼 absolute bottom-[28px] right-[176px]*/}
        </div>
    );
};

export default UserManage;
