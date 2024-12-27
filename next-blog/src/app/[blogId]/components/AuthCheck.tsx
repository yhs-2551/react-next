"use client";

import { useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { Params } from "next/dist/server/request/params";
import LoadingAuth from "../LoadingAuth";
import { useAuthStore } from "@/store/appStore";

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
        if (isHeaderLogin || isInitialized || isAuthenticated) {
            console.log("isHeaderLogin isHeaderLogin>>>", isHeaderLogin);

            try {
                const accessToken = localStorage.getItem("access_token") ?? false;
                if (!accessToken) {
                    throw new Error("unauthorized");
                }

                const decoded = jwtDecode<JwtPayload>(accessToken);
                if (decoded.blogId !== pathBlogId) {
                    throw new Error("unauthorized");
                }

                setIsChecking(false);
            } catch (error) {
                throw new Error("unauthorized");
            }
        }
    }, [isHeaderLogin]);

    if (isChecking) {
        return <LoadingAuth />;
    }

    return <>{children}</>;
}
