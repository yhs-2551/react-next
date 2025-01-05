"use client";

import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { Params } from "next/dist/server/request/params";
import LoadingAuth from "../LoadingAuth";
import { useAuthStore } from "@/store/appStore";
import path from "path";
import GlobalLoading from "@/app/loading";

interface JwtPayload {
    blogId: string;
}

export default function AuthCheck({ children }: { children: React.ReactNode }) {
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const params = useParams();
    const pathBlogId = params.blogId as string;
    const { isHeaderLogin, isAuthenticated, isInitialized } = useAuthStore();

    // 비로그인 사용자, 로그인 사용자 모두 검증
    useEffect(() => {
        const accessToken = localStorage.getItem("access_token") ?? false;
        if (!accessToken) {
            throw new Error("접근 권한이 없습니다.");
        }

        if (isHeaderLogin || isInitialized || isAuthenticated) {
            console.log("isHeaderLogin isHeaderLogin>>>", isHeaderLogin);

            try {
                const decoded = jwtDecode<JwtPayload>(accessToken);
                if (decoded.blogId !== pathBlogId) {
                    throw new Error("접근 권한이 없습니다.");
                }

                setIsChecking(false);
            } catch (error) {
                throw new Error("접근 권한이 없습니다.");
            }
        }
    }, [isHeaderLogin, pathBlogId, isAuthenticated, isInitialized]);

    if (isChecking) {
        return <GlobalLoading type="auth" message="사용자 인증 진행 중..."/>;
    }

    return <>{children}</>;
}
