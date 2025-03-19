"use client";

import { Suspense, useEffect, useState } from "react";
import Pagination from "@/app/_components/pagination/Pagination";
import { PostResponse, PostsReadBaseProps } from "@/types/PostTypes";
import { refreshToken } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";
import { revalidatePostsAndCategories } from "@/actions/revalidate";
import GlobalLoading from "@/app/loading";
import { fetchPostDetail } from "@/actions/post.actions";
import ClientWrapper from "@/providers/ClientWrapper";
import BlogDetail from "./BlogDetail";
import { useRouter } from "next/navigation";

export default function UserPagePostDetailWrapper({ blogId, postId }: { blogId: string; postId: string }) {
    const [post, setPost] = useState<PostResponse>({
        username: "",
        title: "",
        content: "",
        postStatus: "PUBLIC",
        categoryName: "",
        tags: [],
        files: [],
        createdAt: "",
    });

    const [authError, setAuthError] = useState<Error | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const token = localStorage.getItem("access_token");

                const response = await fetchPostDetail(blogId, postId, token);

                setPost(response.data);
            } catch (error: unknown) {
                if (error instanceof Error && error.message === "액세스 토큰 만료") {
                    try {
                        const newAccessToken = await refreshToken();
                        if (newAccessToken) {
                            const retryResponse = await fetchPostDetail(blogId, postId, newAccessToken);
                            setPost(retryResponse.data);
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
                        } else if (error instanceof Error && error.message.includes("게시글을 찾을 수 없습니다")) {
                            router.push("/404");
                        } else if (e instanceof Error && e.message === "특정 사용자 상세 페이지 게시글 데이터를 불러오는데 실패하였습니다.") {
                            setAuthError(new Error("특정 사용자 상세 페이지 게시글 데이터를 불러오는데 실패하였습니다."));
                        }
                    }
                } else if (error instanceof Error && error.message.includes("게시글을 찾을 수 없습니다.")) {
                    router.push("/404");
                } else {
                    setAuthError(new Error("특정 사용자 상세 페이지 게시글 데이터를 불러오는데 실패하였습니다."));
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

    return (
        <>
            <ClientWrapper>
                <BlogDetail initialData={post} postId={postId} />
            </ClientWrapper>
        </>
    );
}
