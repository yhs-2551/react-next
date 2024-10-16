"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useGetPosts } from "@/customHooks/useGetPosts";
// import useCheckAccessToken from "@/customHooks/useCheckAccessToken";
import ClientWrapper from "@/providers/ClientWrapper";
import { extractTextFromHtml } from "@/utils/extractTextFromHtml";

import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';



import PostItem from "./PostItem";

import type { Post } from "@/common/types/Post";
import { checkAccessToken } from "@/services/api";

interface PostWithId extends Post {
    id: string;
}
function BlogList({ initialData }: { initialData: PostWithId[] }) {
    const {
        data: posts = initialData,
        isLoading,
        error,
    } = useGetPosts(initialData);

    const router = useRouter();

    const accessToken = localStorage.getItem("access_token") ?? false;

    const handleNewPost = async () => {
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
            router.push("/posts/new");; // 토큰이 유효할 때 작성 페이지로 접근
        }
    };

    return (
        <>
            <ToastContainer />
            <div className='container max-w-4xl mx-auto p-6'>
                <h2 className='text-2xl font-bold text-center mb-8'>전체 글</h2>

                {/* any 타입 나중에 수정 */}
                {posts?.map((post: PostWithId) => (
                    <PostItem
                        // 여기서 uuid를 사용하면 컴포넌트가 재렌더링 될때마다 새로운 key값이 생성되어 불필요한 재렌더링이 발생할 수 있기 때문에 uuid 사용 안함.
                        // 리스트에서 기존의 항목과 새롭게 추가된 항목을 구분함으로써 불필요한 재렌더링 방지를 위함
                        // uuid를 key값으로 사용하면 모든 리스트 아이템들의 key값이 매번 새롭게 생성되기 때문에, 매번 모든 리스트 요소들이 새롭게 추가되었다고 인식해서 불필요한 재렌더링이 발생하게 된다.
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        content={extractTextFromHtml(post.content)}
                        createdAt={post.createdAt}
                        categoryName={post.categoryName}
                        postStatus={post.postStatus}
                        thumbnailUrl={post.files && post.files.length > 0 ? post.files[0].fileUrl : "https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-thumnail.jfif"}                    />
                ))}
                <button onClick={handleNewPost}>임시로 만든 글쓰기</button>
            </div>
        </>
    );
}

function BlogListWithProvider({ initialData }: { initialData: PostWithId[] }) {


    return (
        <ClientWrapper>
            <BlogList initialData={initialData} />
        </ClientWrapper>
    );
}

export default BlogListWithProvider;
