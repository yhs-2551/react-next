"use client";

import { useParams } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { useAuthStore, userPrivateProfileStore } from "@/store/appStore";

import GlobalLoading from "@/app/loading";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const params = useParams();
    const pathBlogId = params.blogId as string;
    const { isHeaderLogin, isAuthenticated, isInitialized } = useAuthStore();
    const { privateBlogId } = userPrivateProfileStore();

    // 비로그인 사용자, 로그인 사용자 모두 검증
    useEffect(() => {
        const accessToken = localStorage.getItem("access_token") ?? false;
        if (!accessToken) {
            throw new Error("접근 권한이 없습니다.");
        }

        if (isHeaderLogin || isInitialized || isAuthenticated) {

            console.log("privateBlogId: ", privateBlogId);
            console.log("pathBlogId: ", pathBlogId);

            if (privateBlogId !== pathBlogId) {
                throw new Error("접근 권한이 없습니다.");
            }

            setIsChecking(false);
        }
    }, [isHeaderLogin, pathBlogId, isAuthenticated, isInitialized]);

    if (isChecking) {
        return <GlobalLoading type='auth' message='사용자 인증 진행 중...' />;
    }

    return <>{children}</>;
}
