"use client";

import type { Post } from "@/common/types/Post";

import useDeletePost from "@/customHooks/useDeletePost";
import { useGetPost } from "@/customHooks/useGetPost";
import ClientWrapper from "@/providers/ClientWrapper";

import React, { useEffect, useState } from "react";

import { extractTextFromHtml } from "@/utils/extractTextFromHtml";
import { useRouter } from "next/navigation";

import { toast, ToastContainer } from "react-toastify";
import { checkAccessToken, fetchIsAuthor } from "@/services/api";

function BlogDetail({
    initialData,
    postId,
}: {
    initialData: Post;
    postId: string;
}) {
    const router = useRouter();
    const accessToken = localStorage.getItem("access_token") ?? false;
    const [isAuthor, setIsAuthor] = useState(false); // 작성자 여부 상태

    const {
        data: post = initialData,
        isLoading,
        isError,
    } = useGetPost(postId, initialData);

    // 일부 React Hook 특히 useEffect는 React Strict mode에서 두 번 실행 함. 끄고 싶다면 next.config.mjs에서 스트릭트 모드 off 해야함.
    // 새로고침 시 액세스 토큰 유효성 검사 확인하는 로직
    useEffect(() => {
        const validateTokenOnLoad = async () => {
            const isValidToken = await checkAccessToken();

            if (!isValidToken) {
                toast.error("Your session has expired..zzzz.", {
                    position: "top-center",
                    autoClose: 3000,
                    onClose: () => router.push("/login"),
                });
            }
        };

        if (accessToken) {
            validateTokenOnLoad();
        }
    }, []);

    // 아래 fetchIsAuthor 도 액세스 토큰이 있을 경우에만 실행. 액세스 토큰이 유효하다면 작성자 인지 확인하는 로직
    useEffect(() => {
        const fetchAuthorStatus = async () => {
            const isAuthorResponse = await fetchIsAuthor(postId);
            setIsAuthor(isAuthorResponse);
        };

        if (accessToken) {
            fetchAuthorStatus();
        }
    }, []);  

    const deletePost = useDeletePost();

    const formattedDate = new Date(post.createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // 24-hour format
    });

    const handleEdit = async () => {
        if (!accessToken) {
            router.push("/login"); // 로그인 안된 사용자 처리
            return;
        }
        const isValidToken = await checkAccessToken();

        if (!isValidToken) {
            toast.error("Your session has expired.....", {
                position: "top-center",
                autoClose: 3000,
                onClose: () => router.push("/login"),
            });
        } else {
            router.push(`/posts/${postId}/edit`); // 토큰이 유효할 때 수정페이지로 접근
        }
    };

    const handleDelete = () => {
        deletePost.mutate(postId);
    };

    // 비공개로 변경도 클릭 시 토큰 검증 위와 같이 필요
    const handlePostStatus = () => {
        alert(`Change privacy setting from ${post.postStatus}`);
    };

    return (
        <>
            <ToastContainer />
            <div className='container mx-auto p-6 max-w-4xl'>
                {/* Category and Date */}

                <span className='text-sm text-gray-500 mb-2'>
                    카테고리: {post.categoryName || "없음"}
                </span>

                {/* Title */}
                <h1 className='text-3xl font-bold mt-3 mb-3'>{post.title}</h1>

                {/* space-x-4 자식 요소의 x축 간격을 1rem만큼 설정한다. space-x-4에서 4 = 1rem  */}
                <div className='flex space-x-4 mb-2'>
                    <span className='text-sm text-gray-500'>
                        {formattedDate}
                    </span>
                    <span className='text-sm text-gray-500'>
                        {post.userName}
                    </span>
                </div>
                {/* Action Buttons */}
                {isAuthor && (
                    <div className='flex space-x-4 mb-4'>
                        <button
                            onClick={handleEdit}
                            className='text-sm text-gray-500'
                        >
                            수정
                        </button>
                        <button
                            onClick={handlePostStatus}
                            className='text-sm text-gray-500'
                        >
                            {post.postStatus === "PUBLIC"
                                ? "비공개로 변경"
                                : "공개로 변경"}
                        </button>
                        <button
                            onClick={handleDelete}
                            className='text-sm text-gray-500'
                        >
                            삭제
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className='text-gray-700'>
                    {extractTextFromHtml(post.content)}
                </div>
            </div>
        </>
    );
}

function BlogDetailWithProvider({
    initialData,
    postId,
}: {
    initialData: Post;
    postId: string;
}) {
    return (
        <ClientWrapper>
            <BlogDetail initialData={initialData} postId={postId} />
        </ClientWrapper>
    );
}

export default BlogDetailWithProvider;
