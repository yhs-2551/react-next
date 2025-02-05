"use client";

import { useParams } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/store/appStore";

import GlobalLoading from "@/app/loading";
 
import { fetchIsAuthor } from "@/services/api";
 

export default function AuthCheck({ children }: { children: React.ReactNode }) {
 
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const params = useParams();
    const pathBlogId = params.blogId as string;
    const { isHeaderLogin, isAuthenticated, isInitialized } = useAuthStore();

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token") ?? false;
        if (!accessToken) {
            throw new Error("접근 권한이 없습니다.");
        }

        if (isHeaderLogin || isInitialized || isAuthenticated) {
            console.log("isHeaderLogin isHeaderLogin>>>", isHeaderLogin);

            const fetchAuthorStatus: () => Promise<void> = async (): Promise<void> => {
                try {
                    const isAuthor = await fetchIsAuthor(pathBlogId, accessToken);
                    if (!isAuthor) {
                        throw new Error("접근 권한이 없습니다.");
                    } else {
                        return;
                    }
                } catch (error) {
                    console.error("작성자 확인 실패 오류: ", error);
                }
            };

            fetchAuthorStatus();

            setIsChecking(false);
        }
    }, [isHeaderLogin, pathBlogId, isAuthenticated, isInitialized]);

    if (isChecking) {
        return <GlobalLoading type='auth' message='사용자 인증 진행 중...' />;
    }

    return <>{children}</>;
}
