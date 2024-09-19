"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAccessToken, logoutUser } from "@/services/api";

export default function Index() {
    const router = useRouter();

    const accessToken = localStorage.getItem("access_token") ?? false;
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!accessToken); // 작성자 여부 상태

    // 로그인 안된 사용자(로컬 스토리지에 액세스 토큰이 없는 사용자)만 FetchAccessToken 요청을 보냄

    useEffect(() => {
        const initializeAuth = async () => {
            if (accessToken) {
                // 액세스 토큰이 있으면 로그인 상태로 설정
                setIsLoggedIn(true);
            } else {
                // 액세스 토큰이 없으면 fetchAccessToken 호출
                const accessTokenResponse = await fetchAccessToken();
                setIsLoggedIn(accessTokenResponse);
            }
        };

        initializeAuth();
    }, []); // 한 번만 실행

    // 로그인 된 사용자(로컬스토리지에 access token이 있는 사용자)만 useCheckAccessToken 쿼리를 보냄. 메인 페이지에서는 굳이 검증 안함
    // const { data: isValidToken, isLoading: isChecking } =
    //     useCheckAccessToken(storedAccessToken);

    const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        router.push("/login");
    };

    const handleLogoutClick = async () => {
        try {
            await logoutUser();
            setIsLoggedIn(false);
            console.log("로그아웃 성공");
        } catch (error: any) {
            console.log("로그아웃 실패: ", error.message);
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            {isLoggedIn ? (
                <>
                    <button
                        onClick={handleLogoutClick}
                        className='cursor-pointer px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400'
                        // disabled={isLoggingOut}
                    >
                        {/* {isLoggingOut ? "로그아웃 중..." : "로그아웃"} */}
                        로그아웃
                    </button>
                </>
            ) : (
                <>
                    <a
                        onClick={handleLoginClick}
                        className='cursor-pointer px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400'
                    >
                        로그인
                    </a>
                </>
            )}
        </div>
    );
}
