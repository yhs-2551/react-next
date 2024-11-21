"use client";

import { CiCirclePlus } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
 
import { userProfileStore } from "@/store/userProfileStore";
import NextImage from "next/image";
import React, { useState } from "react";
import CommonSideNavigation from "../../../(common-side-navigation)/CommonSideNavigation";

const UserProfile = () => {
    const { profileImage, blogName, blogNickName, blogDescription, setProfileImage, setBlogName, setBlogNickName, setBlogDescription } =
        userProfileStore();

    // 이미지 업로드 핸들러
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl); // 업로드된 이미지를 상태로 관리
        }
    };

    return (
        // 컨텐츠 부분 전체 문서에 수평, 수직 정렬을 위해 profile-wrapper 사용
        <div className='manage-wrapper min-h-screen w-full bg-gray-100 flex items-center justify-center'>
            {/* 왼쪽 사이드바 */}

            <CommonSideNavigation />

            {/* 오른쪽 설정 섹션 */}
            <section className='container lg:max-w-screen-lg p-8 bg-white shadow-md h-[41rem] mt-[5rem] ml-[16rem]' aria-label='블로그 설정'>
                <h2 className='text-2xl font-bold mb-6'>프로필 관리</h2>

                <form className='space-y-6'>
                    <div className='mx-auto h-40 w-40 relative'>
                        <NextImage
                            width={160}
                            height={160}
                            src={
                                profileImage ||
                                "https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-avatar-profile.webp"
                            }
                            alt='사용자 프로필 이미지'
                            priority={true}
                            className='h-full w-full object-cover opacity-30'
                        />
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <label htmlFor='profileImageInput' className='flex items-center justify-center h-10 w-10 bg-gray-500 hover:bg-gray-600 rounded-full cursor-pointer'>
                                <FaPlus className='text-white text-xl' /> {/* React Icon 적용 */}
                            </label>
                        </div>
                        <input id='profileImageInput' type='file' onChange={handleImageUpload} className='hidden' accept='image/*' />
                    </div>

                    <div>
                        <label htmlFor='blogName' className='block text-sm font-medium text-gray-700'>
                            블로그 이름
                        </label>
                        <input
                            id='blogName'
                            type='text'
                            value={blogName}
                            onChange={(e) => setBlogName(e.target.value)}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                        />
                    </div>

                    <div>
                        <label htmlFor='blogNickName' className='block text-sm font-medium text-gray-700'>
                            블로그 닉네임
                        </label>
                        <input
                            id='blogNickName'
                            type='text'
                            value={blogNickName}
                            onChange={(e) => setBlogNickName(e.target.value)}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                        />
                    </div>

                    <div>
                        <label htmlFor='blogDescription' className='block text-sm font-medium text-gray-700'>
                            블로그 설명
                        </label>
                        <textarea
                            id='blogDescription'
                            value={blogDescription}
                            onChange={(e) => setBlogDescription(e.target.value)}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                            placeholder='블로그 설명을 입력해주세요.'
                        />
                    </div>

                    {/* 저장 버튼 */}
                    <button type='submit' className='w-full p-3 bg-blue-600 text-white rounded-md shadow-sm'>
                        변경사항 저장
                    </button>
                </form>
            </section>
        </div>
    );
};

export default UserProfile;
