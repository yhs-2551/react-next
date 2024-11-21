import { userProfileStore } from "@/store/appStore";
import NextImage from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

function CommonSideNavigation() {
    const { profileImage, blogName } = userProfileStore();

    const params = useParams();
    const blogId = params.blogId as string;


    const handleMoveWritePage = () => {
        window.location.assign(`/${blogId}/posts/new`);
    };

    return (
        <aside className='fixed top-20 left-0 w-[16rem] bg-white shadow-md border h-screen' aria-label='블로그 관리 내비게이션'>
            <div className='mb-6'>
                <Link href='/manage/settings/profile' className='block h-[13.5rem] w-full mb-4 cursor-pointer'>
                    {/* 프로필 이미지가 있는 경우 표시, 없으면 기본 이미지 */}
                    <NextImage
                        width={254}
                        height={216}
                        src={profileImage || "https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-avatar-profile.webp"}
                        alt='사용자 프로필 이미지'
                        priority={true}
                        className='h-full w-full object-cover'
                    />
                </Link>
                <h2 className='text-2xl font-bold mb-2'>{blogName}</h2>
                <Link href='https://yhsdeveloper2551.tistory.com' className='text-sm text-gray-500' aria-label='블로그 링크'>
                    yhsdeveloper2551.tistory.com
                </Link>
            </div>

            <nav className='space-y-4' aria-label='블로그 관리 섹션'>
                <section>
                    <button
                        className='w-full text-left p-3 bg-gray-100 rounded-md mb-4'
                        aria-label='글작성 페이지로 이동'
                        onClick={handleMoveWritePage}
                    >
                        글쓰기
                    </button>
                </section>

                <section aria-labelledby='blog-home'>
                    <h2 id='blog-home' className='text-sm font-bold text-gray-700'>
                        블로그 관리 홈
                    </h2>
                </section>

                <section aria-labelledby='content-management'>
                    <h2 id='content-management' className='text-sm font-bold text-gray-700'>
                        콘텐츠
                    </h2>
                    <ul className='space-y-1'>
                        <li className='text-gray-700'>글 관리</li>
                        <li className='text-gray-700'>
                            <Link href='/manage/category'>카테고리 관리</Link>
                        </li>
                    </ul>
                </section>

                <section aria-labelledby='comments-management'>
                    <h2 id='comments-management' className='text-sm font-bold text-gray-700'>
                        댓글 · 방명록
                    </h2>
                    <ul className='space-y-1'>
                        <li className='text-gray-700'>댓글 관리</li>
                        <li className='text-gray-700'>방명록 관리</li>
                    </ul>
                </section>

                <section aria-labelledby='tags-empathy-management'>
                    <h2 id='tags-empathy-management' className='text-sm font-bold text-gray-700'>
                        태그 · 공감
                    </h2>
                    <ul className='space-y-1'>
                        <li className='text-gray-700'>
                        <Link href='/manage/tag'>태그 관리</Link>
                        </li>
                        <li className='text-gray-700'>공감 관리</li>
                    </ul>
                </section>

                <section aria-labelledby='statistics'>
                    <h2 id='statistics' className='text-sm font-bold text-gray-700'>
                        통계
                    </h2>
                    <ul className='space-y-1'>
                        <li className='text-gray-700'>방문 통계</li>
                    </ul>
                </section>
            </nav>
        </aside>
    );
}

export default CommonSideNavigation;
