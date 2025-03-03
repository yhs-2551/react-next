"use client";

import { Suspense, useEffect, useState } from "react";
import Pagination from "@/app/_components/pagination/Pagination";
import { fetchSpecificUserCategoryPaginationPosts } from "@/actions/post.actions";
import { PostsReadBaseProps } from "@/types/PostTypes";
import { refreshToken } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";
import GlobalLoading from "@/app/loading";
import BlogList from "@/app/[blogId]/posts/components/BlogList";
import { useRouter } from "next/navigation";

export default function CategoryPaginationPostListWrapper({
    blogId,
    categoryName,
    decodedCategoryName,
    pageNum,
}: {
    blogId: string;
    categoryName: string;
    decodedCategoryName: string;
    pageNum: string;
}) {
    const [posts, setPosts] = useState<PostsReadBaseProps>({
        content: [],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [authError, setAuthError] = useState<Error | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const token = localStorage.getItem("access_token");

                const response = await fetchSpecificUserCategoryPaginationPosts(blogId, categoryName, pageNum, token);
                const { content, totalPages, currentPage, totalElements } = response.data;
                setPosts({ content, totalPages, currentPage, totalElements });
            } catch (error: unknown) {
                if (error instanceof Error && error.message === "액세스 토큰 만료") {
                    try {
                        const newAccessToken = await refreshToken();
                        if (newAccessToken) {
                            const retryResponse = await fetchSpecificUserCategoryPaginationPosts(blogId, categoryName, pageNum, newAccessToken);
                            const { content, totalPages, currentPage, totalElements } = retryResponse.data;
                            setPosts({ content, totalPages, currentPage, totalElements });
                        }
                    } catch (e: unknown) {
                        if (e instanceof CustomHttpError && e.status === 401) {
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
                        } else if (error instanceof Error && error.message.includes("특정 사용자의 카테고리 페이지네이션 목록 데이터가 없습니다")) {
                            router.push("/404");
                        } else if (e instanceof Error && e.message === "특정 사용자의 카테고리 페이지네이션 데이터를 불러오는데 실패하였습니다.") {
                            setAuthError(new Error("특정 사용자의 카테고리 페이지네이션 데이터를 불러오는데 실패하였습니다."));
                        }
                    }
                } else if (error instanceof Error && error.message.includes("특정 사용자의 카테고리 페이지네이션 목록 데이터가 없습니다")) {
                    router.push("/404");
                } else {
                    setAuthError(new Error("특정 사용자의 카테고리 페이지네이션 데이터를 불러오는데 실패하였습니다."));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [blogId]);

    if (isLoading) return <GlobalLoading />;

    if (authError) {
        throw authError;
    }

    const isExistContent = posts.content.length > 0;

    return (
        <>
            <Suspense>
                <BlogList initialData={posts.content} isSearch={false} totalElements={posts.totalElements} />
                <Pagination
                    isExistContent={isExistContent}
                    totalPages={posts.totalPages}
                    currentPage={posts.currentPage}
                    blogId={blogId}
                    category={decodedCategoryName}
                />
            </Suspense>
        </>
    );
}
