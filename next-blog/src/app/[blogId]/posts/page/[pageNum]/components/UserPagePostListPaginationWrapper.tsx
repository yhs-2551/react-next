"use client";

import { Suspense, useEffect, useState } from "react";
import Pagination from "@/app/_components/pagination/Pagination";
import { fetchSpecificUserPaginationPosts, fetchSpecificUserPosts } from "@/actions/post.actions";
import { PostResponse, PostsReadBaseProps } from "@/types/PostTypes";
import { refreshToken } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";
import GlobalLoading from "@/app/loading";
import BlogList from "../../../components/BlogList";

export default function UserPagePostListPaginationWrapper({ blogId, pageNum }: { blogId: string; pageNum: string }) {
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

                const response = await fetchSpecificUserPaginationPosts(blogId, pageNum, token);
                const { content, totalPages, currentPage, totalElements } = response.data;
                setPosts({ content, totalPages, currentPage, totalElements });
            } catch (error: unknown) {
                if (error instanceof Error && error.message === "액세스 토큰 만료") {
                    try {
                        const newAccessToken = await refreshToken();
                        if (newAccessToken) {
                            const retryResponse = await fetchSpecificUserPaginationPosts(blogId, pageNum, newAccessToken);
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
                        } else if (e instanceof Error && e.message === "특정 사용자 페이지네이션 목록 데이터를 불러오는데 실패하였습니다.") {
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
                <Pagination isExistContent={isExistContent} totalPages={posts.totalPages} currentPage={posts.currentPage} blogId={blogId} />
            </Suspense>
        </>
    );
}
