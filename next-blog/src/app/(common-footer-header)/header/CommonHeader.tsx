"use client";

import Search from "@/app/[blogId]/posts/components/search/Search";
import LoginModal from "@/app/_components/auth/LoginModal";
import { logoutUser } from "@/services/api";
import { useAuthStore } from "@/store/appStore";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";

import React, { useEffect, useRef, useState } from "react";
import { FaCog } from "react-icons/fa";

export default function CommonHeader() {
    // const pathname = usePathname();

    {
        /* {pathname === "/posts" ? (
                    <h1 className="text-3xl font-bold text-center border-b p-6">
                        YHS의 블로그
                    </h1>
                ) : (
                    <h1 className="text-3xl font-bold text-center border-b p-6">
                        글 작성 페이지
                    </h1>
                )} */
    }

    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    const { isInitialized } = useAuthStore();

    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const router = useRouter();

    const { setShowLogin } = useAuthStore();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setIsMenuOpen(false);
        }
    };

    // zustand의 상태관리는 휘발성이기 때문에 zustand 전역상태로 로그인을 관리하기 보다 페이지를 새로고침 시키면서 아래 useEffect 재실행 시킴.
    // 재실행됨에 따라 액세스 토큰 유무로 로그인 상태를 관리.
    useEffect(() => {
        if (isInitialized) {
            console.log("실행 헤더");
            // console.log("CommonHeader useEffect 실행");

            // useEffect 내부가 아닌 외부에서 실행하면 서버사이드 렌더링에서 브라우저의 localStorage를 정의할 수 없다는 오류 발생.
            const accessToken = localStorage.getItem("access_token");
            console.log("accessToken: ", accessToken);
            setIsLoggedIn(!!accessToken);

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [isInitialized]);

    const handleManageClick = () => {
        router.push("/manage");
    };

    const handleProfileClick = () => {
        router.push("/manage/settings/profile");
    };

    const handleLogoutClick = async () => {
        if (isLoggedIn) {
            try {
                const logoutSuccessResponse = (await logoutUser()) as string;

                if (logoutSuccessResponse) {
                    setIsMenuOpen(false);
                    setIsLoggedIn(false);
                    window.location.reload();
                }
            } catch (error: any) {
                // 로그아웃 실패의 경우 토스트 메시지로 사용자에게 알릴 순 있지만, 일단 보류
                console.log("로그아웃 실패: ", error.message);
            }
        }
    };

    const handleLoginClick = () => {
        setShowLogin(true); // AuthProvider에서 지정한 LoginModal 실행됨.
    };

    return (
        <header className='bg-white flex items-center justify-between h-[5rem] fixed top-0 left-0 w-full'>
            <div className='flex items-center'>
                <img src='/path/to/logo.png' alt='Logo' className='h-8 w-8 mr-2' />
                <span className='text-xl font-bold'>YHS의 블로그</span>
            </div>
            <Search />
            <div className='flex items-center ql-toolbar-container'>
                {/* {pathname === "/posts" ? (
                    <h1 className="text-3xl font-bold">YHS의 블로그</h1>
                ) : (
                    <h1 className="text-3xl font-bold">글 작성 페이지</h1>
                )} */}
            </div>
            {isLoggedIn ? (
                <div className='relative' ref={menuRef}>
                    <NextImage
                        src={"https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-avatar-profile.webp"}
                        width={36}
                        height={36}
                        alt='사용자 계정 이미지'
                        onClick={toggleMenu}
                        className='w-9 h-9 rounded-full cursor-pointer'
                        priority={true}
                    />
                    {isMenuOpen && (
                        <nav className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4' aria-label='Account menu'>
                            <div className='border-b pb-4 mb-4'>
                                <strong className='text-xl font-bold'>홍길동</strong>

                                <div className='flex items-center justify-between'>
                                    <p className='text-sm text-gray-500'>홍길동@daum.net</p>
                                    <button
                                        aria-label='프로필 관리 페이지로 이동'
                                        onClick={handleProfileClick}
                                        className='text-gray-500 hover:text-gray-700'
                                    >
                                        프로필 관리
                                    </button>
                                </div>
                            </div>
                            <div className='mb-4'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-gray-800'>길동의 티스토리</span>
                                    <button
                                        aria-label='블로그 관리 페이지로 이동'
                                        onClick={handleManageClick}
                                        className='text-gray-500 hover:text-gray-700'
                                    >
                                        <FaCog />
                                    </button>
                                </div>
                            </div>
                            <button
                                className='w-full text-left text-red-500 hover:text-red-700 font-medium focus:outline-none mt-4'
                                aria-label='로그아웃 처리'
                                onClick={handleLogoutClick}
                            >
                                로그아웃
                            </button>
                        </nav>
                    )}
                </div>
            ) : (
                <button
                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    onClick={handleLoginClick}
                >
                    로그인
                </button>
            )}
        </header>
    );
}
