"use client";

 
import useDeletePost from "@/customHooks/useDeletePost";
import { useGetPost } from "@/customHooks/useGetPost";
import ClientWrapper from "@/providers/ClientWrapper";
 
import React from "react";

import { extractTextFromHtml } from "@/utils/extractTextFromHtml";
import { useRouter } from "next/navigation";


interface Post {
    title: string;
    postStatus: "PUBLIC" | "PRIVATE";
    categoryName: string | null;
    createdAt: string;
    content: string;
    // commentCount: number;
    // id: number;
    // replyCount: number;
    // updatedAt: string; 이것도 admin 페이지에서 관리할지 고민
    // userId: number | null;
    // userName: string | null; 사용자명은 상세페이지에서 보여줄 지 고미
    // views: number; // 조회수는 따로 admin에서 관리할지, 다른 사용자가 조회했을때 바로 메인 페이지에서 조회수를 보여줄지 고민. 전자가 좋아보임
}
function BlogDetail({
    initialData,
    postId,
}: {
    initialData: Post;
    postId: string;
}) {
    const router = useRouter();

    const {
        data: post = initialData,
        isLoading,
        isError,
    } = useGetPost(postId, initialData);

    const deletePost = useDeletePost();

    const formattedDate = new Date(post.createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // 24-hour format
    });

    const handleEdit = () => {
        router.push(`/posts/${postId}/edit`)
    };

    const handlePostStatus = () => {
        alert(`Change privacy setting from ${post.postStatus}`);
    };

    const handleDelete = () => {
        deletePost.mutate(postId);
        router.push("/posts");
    };

    return (
        <div className='container mx-auto p-6 max-w-4xl'>
            {/* Title */}
            <h1 className='text-3xl font-bold mb-2'>{post.title}</h1>

            {/* Category and Date */}
            <div className='flex items-center text-sm text-gray-500 mb-2'>
                <span className='mr-4'>
                    카테고리: {post.categoryName || "없음"}
                </span>
                <span>{formattedDate}</span>
            </div>

            {/* Action Buttons */}
            <div className='flex space-x-4 mb-4'>
                <button onClick={handleEdit} className='text-sm text-gray-500'>
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

            {/* Content */}
            <div className='text-gray-700'>{extractTextFromHtml(post.content)}</div>
        </div>
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
