"use client";

import { useParams } from "next/navigation";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/appStore";

import { fetchIsAuthor } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";

import BlogLoading from "../loading";

// 여기에 블로그 주인 유무 확인해서 error.tsx 컴포넌트를 호출하는데, 호출하는 찰나의 순간에 해당 블로그의 content가 살짝 보이는 현상 발생.
// 어차피 다른 사용자도 볼 수 있는 데이터라 직접적인 수정을 하는거 아니면 상관x, 나중에 보안이 중요한 데이터가 발생시 이전 방식 or 다른 방식으로 수정 고려
export default function AuthCheck({ children }: { children: React.ReactNode }) {
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [authError, setAuthError] = useState<Error | null>(null);

    const params = useParams();
    const pathBlogId = params.blogId as string;
    const { isHeaderLogin, isAuthenticated, isInitialized } = useAuthStore();

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            setAuthError(new Error("접근 권한이 없습니다.")); // 여기선 throw new error 바로 터트려도 error.tsx 실행되긴 하는데 일관성을 위해 상태로 관리
            setIsChecking(false);
            return;
        }

        if (isHeaderLogin || isInitialized || isAuthenticated) {
            const fetchAuthorStatus: () => Promise<void> = async (): Promise<void> => {
                try {
                    const isAuthor = await fetchIsAuthor(pathBlogId, accessToken);
                    if (!isAuthor) {
                        setAuthError(new Error("접근 권한이 없습니다.")); // 여기에서 throw new error로 터트리면 error.tsx가 실행이 안되어서 이렇게 상태로 관리
                        return;
                    } else {
                        return;
                    }
                } catch (error: unknown) {
                    if (error instanceof CustomHttpError && error.status === 401) {
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
                    } else if (error instanceof CustomHttpError && error.status === 500) {
                        // 서버측 오류로 인해 작성자 확인이 불가능합니다.
                        toast.error(
                            <span>
                                <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                            </span>,
                            {
                                onClose: () => {
                                    setAuthError(new Error("서버측 오류가 발생하였습니다."));
                                },
                            }
                        );
                    }
                }
            };

            // 그냥 fetchAuthorStatus()를 하면 fetchAuthorStatus는 비동기 함수이기 때문에 fetchAuthorStatus() 내부에서 await을 사용하였다고 하더라도 fetchAuthorStatus함수의 실행이 끝날때까지 기다리지 않음.
            fetchAuthorStatus().then(() => {
                setIsChecking(false);
            });
        }
    }, [isHeaderLogin, pathBlogId, isAuthenticated, isInitialized]);

    if (isChecking) {
        return <BlogLoading />;
    }

    if (authError) {
        throw authError;
    }

    return <>{children}</>;
}
