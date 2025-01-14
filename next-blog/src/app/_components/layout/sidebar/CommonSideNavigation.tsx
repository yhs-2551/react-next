
import { userProfileStore } from "@/store/appStore";
import NextImage from "next/image";
import Link from "next/link";
import React from "react";

import { FiEdit2 } from "react-icons/fi";
import { TbCategory } from "react-icons/tb";
import { TbFileText } from "react-icons/tb";


function CommonSideNavigation() {
    const { profileImage, blogName, blogId } = userProfileStore();

    return (
        <aside className='fixed top-20 left-0 w-[16rem] bg-white shadow-md border h-screen' aria-label='블로그 관리 내비게이션'>
            <div className='mb-6'>
                <Link href={`/${blogId}/manage`} className='block h-[13.5rem] w-full mb-6 cursor-pointer'>
                    {/* 프로필 이미지가 있는 경우 표시, 없으면 기본 이미지 */}
                    <NextImage
                        width={254}
                        height={216}
                        src={profileImage || "https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-avatar-profile.webp"}
                        alt='사용자 프로필 이미지'
                        quality={100}
                        sizes="(max-width: 160px) 100vw, 254px"  
                        priority={true}
                        className='h-full w-full object-cover'
                    />
                </Link>

                <Link href={`/${blogId}/posts`} className='block'>
                    <h2 className='text-2xl font-semibold text-gray-800 hover:text-gray-600 transition-colors px-4'>
                        {blogName}
                    </h2>
                </Link>
            </div>

            <nav className='space-y-6 px-4' aria-label='블로그 관리 섹션'>
                <section>
                    <Link
                        href={`/${blogId}/posts/new`}
                        className='block w-full text-left p-4 bg-gray-800 rounded-lg mb-6 hover:bg-gray-700 transition-all shadow-sm hover:shadow-md text-white font-medium'
                        aria-label='글작성 페이지로 이동'
                    >
                        <span className='flex items-center gap-2'>
                            <FiEdit2 className='text-lg' />
                            글쓰기
                        </span>
                    </Link>
                </section>
                <section aria-labelledby='blog-home'>
                    <Link href={`/${blogId}/manage`}>
                        <h2
                            id='blog-home'
                            className='text-base font-bold text-gray-800 hover:text-gray-600 transition-colors pb-4 border-b-2 border-gray-200'
                        >
                            <span className='flex items-center gap-2'>
                                <TbCategory className='text-lg' />
                                블로그 관리 홈
                            </span>
                        </h2>
                    </Link>
                </section>

                <section aria-labelledby='content-management' className='text-gray-800 rounded-lg'>
                    <h2 id='content-management' className='font-medium mb-3 flex items-center gap-2'>
                        <TbFileText className='text-lg' />
                        콘텐츠
                    </h2>
                    <ul className='space-y-2'>
                        {/* <li className='text-gray-700'>글 관리</li> */}
                        <li>
                            <Link
                                href={`/${blogId}/manage/category`}
                                className='text-gray-800 hover:text-gray-600 transition-colors flex items-center gap-2 py-1'
                            >
                                <span className='text-sm'>└ 카테고리 관리</span>
                            </Link>
                        </li>
                    </ul>
                </section>

                {/* <section aria-labelledby='comments-management'>
                    <h2 id='comments-management' className='text-sm font-bold text-gray-700'>
                        댓글 · 방명록
                    </h2>
                    <ul className='space-y-1'>
                        <li className='text-gray-700'>댓글 관리</li>
                        <li className='text-gray-700'>방명록 관리</li>
                    </ul>
                </section> */}

                {/* <section aria-labelledby='tags-empathy-management'>
                    <h2 id='tags-empathy-management' className='text-sm font-bold text-gray-700'>
                        태그 · 공감
                    </h2>
                    <ul className='space-y-1'>
                        <li className='text-gray-700'>
                            <Link href={`/${blogId}/manage/tag`}>태그 관리</Link>
                        </li>
                        <li className='text-gray-700'>공감 관리</li>
                    </ul>
                </section> */}

                {/* <section aria-labelledby='statistics'>
                    <h2 id='statistics' className='text-sm font-bold text-gray-700'>
                        통계
                    </h2>
                    <ul className='space-y-1'>
                        <li className='text-gray-700'>방문 통계</li>
                    </ul>
                </section> */}
            </nav>
        </aside>
    );
}

export default CommonSideNavigation;
