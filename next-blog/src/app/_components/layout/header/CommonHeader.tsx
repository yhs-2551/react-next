"use client";
import { checkAccessToken, logoutUser } from "@/services/api";
import { useAuthStore, userProfileStore } from "@/store/appStore";
import { FiMenu } from "react-icons/fi";
import { CiSettings } from "react-icons/ci";

import NextImage from "next/image";

import { useParams, usePathname } from "next/navigation";

import React, { useEffect, useRef, useState } from "react";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";
import { refreshToken } from "@/utils/refreshToken"; 
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import SearchContainer from "../../search/SearchContainer";
import MenuModal from "../../modal/MenuModal";

interface DecodedToken {
    blogId: string;
    username: string;
    email: string;
}

export default function CommonHeader() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    const { isInitialized, setShowLogin, isAuthenticated, setHeaderLogin } = useAuthStore();
    const { blogUsername } = userProfileStore();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const hamburgerMenuModalRef = useRef<HTMLDivElement>(null);
    const hamburgerMenuButtonRef = useRef<HTMLButtonElement>(null);

    const [blogIdFromToken, setBlogIdFromToken] = useState<string | null>(null);
    const [usernameFromToken, setUsernameFromToken] = useState<string | null>(null);
    const [emailFromToken, setEmailFromToken] = useState<string | null>(null);

    const params = useParams();
    const pathBlogId = params.blogId as string | undefined;

    const pathname = usePathname();

    const hideMenuPaths = ["/posts/new", "/edit"];
    const isWriteOrEditPage = hideMenuPaths.some((path) => pathname?.includes(path));
    const isPostDetailPage = pathname?.includes("/posts/") && !isNaN(Number(pathname.split("/posts/")[1]));
    const isManagePage = pathname?.includes("/manage");
    const isPostListPage = pathname === `/${pathBlogId}/posts` || pathname.includes(`/${pathBlogId}/posts/page`);
    const isCategoryPage = pathname?.includes(`/${pathBlogId}/categories`);

    const TOKEN_KEY = "access_token";

    useEffect(() => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) {
                const decodedToken = jwtDecode<DecodedToken>(token);

                setBlogIdFromToken(decodedToken.blogId);
                setUsernameFromToken(decodedToken.username);
                setEmailFromToken(decodedToken.email);
            }
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    }, [isLoggedIn]); // 로그인 할때마다 새로운 액세스 토큰으로 blogId를 가져옴.

    // zustand의 상태관리는 휘발성이기 때문에 zustand 전역상태로 로그인을 관리하기 보다 페이지를 새로고침 시키면서 아래 useEffect 재실행 시킴.
    // 재실행됨에 따라 액세스 토큰 유무로 로그인 상태를 관리.
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsUserMenuOpen(false);
            }

            if (
                hamburgerMenuModalRef.current &&
                !hamburgerMenuModalRef.current.contains(e.target as Node) &&
                hamburgerMenuButtonRef.current &&
                !hamburgerMenuButtonRef.current.contains(e.target as Node)
            ) {
                setIsHamburgerMenuOpen(false);
            }
        };

        //isAuthenticated는 일반 form 로그인
        if (isInitialized || isAuthenticated) {
            // useEffect 내부가 아닌 외부에서 실행하면 서버사이드 렌더링에서 브라우저의 localStorage를 정의할 수 없다는 오류 발생.
            const accessToken = localStorage.getItem("access_token");

            const isAccessToken = accessToken && accessToken !== null && accessToken !== undefined && accessToken !== "";

            if (isAccessToken) {
                setIsLoggedIn(true);
                //setHeaderLogin는 AuthCheck부분을 위해. window.location 새로고침 기능 대신 router.push 기능을 사용하기 위해, 즉 ux향상을 위해 사용
                setHeaderLogin(true);
            }

            // 초기화(원래값인 false로)를 하면 의도치 않은 결과가 나오게 됨
            // setInitialized(false);

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [isInitialized, isAuthenticated]);

    const handleLogoutClick = async () => {
        if (isLoggedIn) {
            try {
                const logoutSuccessResponse = (await logoutUser()) as string;

                if (logoutSuccessResponse) {
                    setIsUserMenuOpen(false);
                    setIsLoggedIn(false);
                    // window.location.reload();
                }
            } catch (error: any) {
                // 로그아웃 실패의 경우 토스트 메시지로 사용자에게 알릴 순 있지만, 일단 보류
                console.log("로그아웃 실패: ", error.message);
            }
        }
    };

    const handleNewPost = async () => {
        const isValidToken = await checkAccessToken();

        if (isValidToken === null) {
            return;
        }

        if (isValidToken === false) {
            try {
                const newAccessToken = await refreshToken();
                if (newAccessToken) {
                    window.location.assign(`/${blogIdFromToken}/posts/new`);
                    // router.push("/posts/new");
                }
            } catch (error: unknown) {
                // 리프레시 토큰까지 만료되어서 재로그인 필요
                if (error instanceof CustomHttpError) {
                    localStorage.removeItem("access_token");

                    toast.error(
                        <span>
                            <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                        </span>,
                        {
                            onClose: () => {
                                window.location.reload();
                            },
                        }
                    );
                }
            }
        } else if (isValidToken === true) {
            window.location.assign(`/${blogIdFromToken}/posts/new`);
        }
    };

    return (
        <>
            {/* MenuModalWrapper이 없으면 useGetAllCategories함수 내에 localstorage에 접근할 때 서버사이드 렌더링 오류가 발생하게 됨(undefined 오류) */}
            {(isCategoryPage || isPostListPage) && (
                <div ref={hamburgerMenuModalRef}>
                    <MenuModal isOpen={isHamburgerMenuOpen} onClose={() => setIsHamburgerMenuOpen(false)} />
                </div>
            )}

            {/* 로그인 모달의 z-index는 999 헤더는 998로 해야 로그인 모달이 띄워지면서 백드랍 효과 발생 */}
            <header className='bg-white flex items-center justify-between h-[5rem] fixed top-0 left-0 w-full z-[998] border-b-2 px-10'>
                {/* 왼쪽: 로고와 검색창 */}
                <div className='flex items-center gap-6'>
                    <div className='flex items-center gap-2'>
                        <Link href='/'>
                            <h1 className='cursor-pointer'>
                                <span className='text-xl font-bold'>DevLog</span>
                            </h1>
                        </Link>

                        {pathBlogId && !isWriteOrEditPage && !isPostDetailPage && !isManagePage && (
                            <button
                                ref={hamburgerMenuButtonRef}
                                onClick={() => setIsHamburgerMenuOpen(!isHamburgerMenuOpen)}
                                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                            >
                                <FiMenu className='w-5 h-5' />
                            </button>
                        )}
                    </div>
                    {!isWriteOrEditPage && !isPostDetailPage && !isManagePage && <SearchContainer />}
                </div>

                {/* 중앙 블로그 제목 */}

                {pathBlogId && !isWriteOrEditPage && !isManagePage && (
                    <div className='absolute left-1/2 transform -translate-x-1/2'>
                        <Link href={`/${pathBlogId}/posts`}>
                            <h2 className='text-xl font-bold cursor-pointer'>{`${blogUsername}의 DevLog`}</h2>
                        </Link>
                    </div>
                )}

                {isWriteOrEditPage && <div className='flex items-center ql-toolbar-container' role='toolbar' aria-label='에디터 툴바'></div>}

                {isLoggedIn ? (
                    <div className='relative' ref={menuRef}>
                        <div className='flex items-center gap-4'>
                            {!isWriteOrEditPage && (
                                <button
                                    className='px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-full  hover:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none'
                                    onClick={handleNewPost}
                                >
                                    새 글 작성
                                </button>
                            )}

                            <NextImage
                                src={"https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-avatar-profile.webp"}
                                width={36}
                                height={36}
                                alt='사용자 계정 이미지'
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className='w-9 h-9 rounded-full cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all'
                                priority={true}
                            />
                        </div>
                        {isUserMenuOpen && (
                            <div className='absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100'>
                                <div className='px-4 py-2'>
                                    <p className='pt-2 text-gray-800'>{usernameFromToken}</p>
                                    <p className='text-sm text-gray-800 pt-2'>{emailFromToken}</p>
                                </div>
                                <div className='px-4 pb-2 flex flex-col gap-2'>
                                    <Link
                                        href={`/${blogIdFromToken}/posts`}
                                        className='w-full text-left rounded-lg transition-colors text-gray-800 hover:text-gray-500'
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        {`${usernameFromToken}의 DevLog`}
                                    </Link>

                                    <Link
                                        href={`/${blogIdFromToken}/manage`}
                                        className='flex justify-between w-full text-left text-gray-800 hover:text-gray-500 rounded-lg transition-colors'
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        설정
                                        <CiSettings />
                                    </Link>

                                    <button
                                        onClick={handleLogoutClick}
                                        className='w-full pb-2 text-left text-red-600 hover:text-red-300 rounded-lg transition-colors mt-1'
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        className='px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-full 
                hover:bg-gray-700 transition-colors duration-200 ease-in-out 
                focus:outline-none'
                        onClick={() => setShowLogin(true)} // AuthProvider에서 지정한 LoginModal 실행됨.
                    >
                        로그인
                    </button>
                )}
            </header>
        </>
    );
}
