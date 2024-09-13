"use client";

import { useRouter } from "next/navigation";

import { useQuery } from "react-query";

import useLogout from "@/customHooks/useLogout";
import useFetchAccessToken from "@/customHooks/useFetchAccessToken";
import useCheckAccessToken from "@/customHooks/useCheckAccessToken";
import { useEffect } from "react";

export default function Index() {
    const router = useRouter();

    const { mutate: logout, isLoading: isLoggingOut } = useLogout();

    const { data: isLoggedInData, isLoading: isTokenLoading } = useFetchAccessToken();

    const isLoggedIn = isLoggedInData ?? false; // isLoggedInData가 null 및 undefined면 false로 처리. 

    const { data: isValidData, isLoading: isChecking } = useCheckAccessToken(isLoggedIn);

    const isValid = isValidData ?? false;

    console.log("isLoggedIn값" + isLoggedIn);
    console.log("isValid값" + isValid);

    const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        router.push("/login");
    };

    const handleLogoutClick = () => {
        logout();
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            {isLoggedIn && isValid ? (
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
