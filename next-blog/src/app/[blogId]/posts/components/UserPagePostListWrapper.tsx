"use client";

import { Suspense, useEffect, useState } from "react";
import BlogList from "./BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { fetchSpecificUserPosts } from "@/actions/post.actions";
import { PostResponse, PostsReadBaseProps } from "@/types/PostTypes";
import { refreshToken } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";
import { revalidatePostsAndCategories } from "@/actions/revalidate";
import GlobalLoading from "@/app/loading";

export default function UserPagePostListWrapper({ blogId }: { blogId: string }) {
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

                const response = await fetchSpecificUserPosts(blogId, token);
                const { content, totalPages, currentPage, totalElements } = response.data;
                setPosts({ content, totalPages, currentPage, totalElements });
            } catch (error: unknown) {
                if (error instanceof Error && error.message === "액세스 토큰 만료") {
                    try {
                        const newAccessToken = await refreshToken();
                        if (newAccessToken) {
                            const retryResponse = await fetchSpecificUserPosts(blogId, newAccessToken);
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
                        } else if (e instanceof Error && e.message === "특정 사용자 게시글 목록 데이터를 불러오는데 실패하였습니다.") {
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
            {/* useSearchParams를 사용한 컴포넌트에선 Suspense로 감싸줘야함
            공식문서 내용: Suspense로 감싸면 this will ensure the page does not de-opt to client-side rendering.
            SSR -> CSR로 강제 전환되는 것을 방지. 즉 서버 사이드렌더링을 통해 최적화 유지하기 위함 */}
            <Suspense>
                <BlogList initialData={posts.content} isSearch={false} totalElements={posts.totalElements} />
                <Pagination isExistContent={isExistContent} totalPages={posts.totalPages} currentPage={posts.currentPage} blogId={blogId} />
            </Suspense>
        </>
    );
}
