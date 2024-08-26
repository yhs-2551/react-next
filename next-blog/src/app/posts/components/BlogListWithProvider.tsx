"use client"

import React from "react";
import PostItem from "./PostItem";

import { useGetPosts } from "@/customHooks/useGetPosts";

import { v4 as uuidv4 } from "uuid";
import ClientWrapper from "@/providers/ClientWrapper";
import { extractTextFromHtml } from "@/utils/extractTextFromHtml";

interface Post {
    id: string;
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

function BlogList({ initialData }: { initialData: Post[] }) {
    const {
        data: posts = initialData,
        isLoading,
        error,
    } = useGetPosts(initialData);

    return (
        <div className='container max-w-4xl mx-auto p-6'>
            <h2 className='text-2xl font-bold text-center mb-8'>전체 글</h2>

            {/* any 타입 나중에 수정 */}
            {posts?.map((post: Post) => (
                <PostItem
                    key={uuidv4()}
                    id={post.id}
                    title={post.title}
                    content={extractTextFromHtml(post.content)}
                    createdAt={post.createdAt}
                    categoryName={post.categoryName}
                    postStatus={post.postStatus}
                />
            ))}
        </div>
    );
}

function BlogListWithProvider({ initialData }: { initialData: Post[] }) {
    return (
        <ClientWrapper>
            <BlogList initialData={initialData} />
        </ClientWrapper>
    );
}

export default BlogListWithProvider;
