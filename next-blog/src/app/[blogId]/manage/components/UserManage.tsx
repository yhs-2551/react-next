"use client";

import { CiCirclePlus } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import NextImage from "next/image";
import React, { useState } from "react";
import { userProfileStore } from "@/store/appStore";
import CommonSideNavigation from "@/app/_components/layout/sidebar/CommonSideNavigation";

const UserManage = () => {
    const {
        profileImage,
        blogName,
        blogId,
        blogUsername,
        blogDescription,
        setProfileImage,
        setBlogId,
        setBlogName,
        setBlogUsername,
        setBlogDescription,
    } = userProfileStore();

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
            <section
                className='container lg:max-w-screen-lg p-10 bg-white rounded-lg shadow-lg h-[41rem] mt-[5rem] ml-[16rem]'
                aria-label='블로그 설정'
            >
                <h2 className='text-2xl font-bold mb-8 text-gray-800 flex justify-center'>블로그 관리</h2>

                <form className='space-y-7 max-w-2xl mx-auto'>
                    <div className='mx-auto h-40 w-40 relative group'>
                        <NextImage
                            width={160}
                            height={160}
                            src={
                                profileImage ||
                                "https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-avatar-profile.webp"
                            }
                            alt='사용자 프로필 이미지'
                            priority={true}
                            className='h-full w-full object-cover rounded-full transition-opacity'
                            style={{ imageRendering: "auto" }}
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
                            onChange={(e) => setBlogId(e.target.value)}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed focus:ring-2 focus:ring-blue-200'
                        />
                    </div>

                    <div>
                        <label htmlFor='blogName' className='block text-sm font-medium text-gray-700 mb-1'>
                            블로그 이름
                        </label>
                        <input
                            id='blogName'
                            type='text'
                            value={blogName}
                            onChange={(e) => setBlogName(e.target.value)}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                        />
                    </div>

                    <div>
                        <label htmlFor='blogNickName' className='block text-sm font-medium text-gray-700 mb-1'>
                            블로그 닉네임
                        </label>
                        <input
                            id='blogNickName'
                            type='text'
                            value={blogUsername}
                            onChange={(e) => setBlogUsername(e.target.value)}
                            className='mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                        />
                    </div>

                    {/* 저장 버튼 */}
                    <div className='flex justify-end mt-8'>
                        <button
                            type='submit'
                            className='px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-sm transition-colors duration-200 ease-in-out'
                        >
                            변경사항 저장
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default UserManage;
