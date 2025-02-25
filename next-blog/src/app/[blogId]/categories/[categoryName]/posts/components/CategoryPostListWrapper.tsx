"use client";

import { Suspense, useEffect, useState } from "react";
import Pagination from "@/app/_components/pagination/Pagination";
import { fetchSpecificUserCategoryPosts } from "@/actions/post.actions";
import { PostResponse, PostsReadBaseProps } from "@/types/PostTypes";
import { refreshToken } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";
import { revalidatePostsAndCategories } from "@/actions/revalidate";
import GlobalLoading from "@/app/loading";
import BlogList from "@/app/[blogId]/posts/components/BlogList";

export default function CategoryPostListWrapper({
    blogId,
    categoryName,
    decodedCategoryName,
}: {
    blogId: string;
    categoryName: string;
    decodedCategoryName: string;
}) {
    const [posts, setPosts] = useState<PostsReadBaseProps>({
        content: [],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const token = localStorage.getItem("access_token");

                const response = await fetchSpecificUserCategoryPosts(blogId, categoryName, token);
                const { content, totalPages, currentPage, totalElements } = response.data;
                setPosts({ content, totalPages, currentPage, totalElements });
            } catch (error: unknown) {
                if (error instanceof Error && error.message === "액세스 토큰 만료") {
                    try {
                        const newAccessToken = await refreshToken();
                        if (newAccessToken) {
                            const retryResponse = await fetchSpecificUserCategoryPosts(blogId, categoryName, newAccessToken);
                            const { content, totalPages, currentPage, totalElements } = retryResponse.data;
                            setPosts({ content, totalPages, currentPage, totalElements });
                        }
                    } catch (e: unknown) {
                        if (e instanceof CustomHttpError && e.status === 401) {
                            await revalidatePostsAndCategories(blogId); // 리프레시 토큰까지 만료되면 공개글만 볼 수 있도록 함

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
                        } else if (e instanceof Error && e.message === "특정 사용자의 카테고리 목록 데이터를 불러오는데 실패하였습니다.") {
                            throw e;
                        }
                    }
                } else {
                    throw error;
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [blogId]);

    if (isLoading) return <GlobalLoading />;

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
