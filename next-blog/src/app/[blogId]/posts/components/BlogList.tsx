"use client";

import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

// import { useGetPosts } from "@/customHooks/useGetPosts";
// import useCheckAccessToken from "@/customHooks/useCheckAccessToken";
import ClientWrapper from "@/providers/ClientWrapper";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PostItem from "./PostItem";
import { PostResponse } from "@/types/PostTypes";
import { checkAccessToken } from "@/services/api";
import { refreshToken } from "@/utils/refreshToken";

interface DecodedToken {
    blogId: string;
}

interface BlogListProps {
    initialData: PostResponse[];
    blogId: string;
}

function BlogList({ initialData, blogId }: BlogListProps) {
    const [blogIdFromToken, setBlogIdFromToken] = useState<string | null>(null);
    const posts = initialData;
 

    const TOKEN_KEY = "access_token";

    // 여러 사용자가 있을 때 해당 사용자 본인만 글쓰기를 볼 수 있음.
    useEffect(() => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) {
                const decodedToken = jwtDecode<DecodedToken>(token);
                setBlogIdFromToken(decodedToken.blogId);
            }
        } catch (error) {
            console.error("Error decoding token:", error);
        }

        console.log("blogIdFromToken >>>", blogIdFromToken);
        console.log("blogId >>>", blogId);
    }, [blogIdFromToken]);

    const handleNewPost = async () => {

        // 토큰이 있어야만 애초에 글쓰기를 볼 수 있음. 주석처리
        // const token = localStorage.getItem(TOKEN_KEY);
        // if (!token) {
        //     router.push("/login"); // 로그인 안된 본인 처리
        //     return;
        // }
        const isValidToken = await checkAccessToken();

        if (!isValidToken) {
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                const isValidToken = await checkAccessToken();
                if (isValidToken) {
                    // 최종적으로 토큰이 유효할 때 작성 페이지로 접근
                    window.location.assign(`/${blogId}/posts/new`);
                    // router.push("/posts/new");
                }
                if (!isValidToken) {
                    throw new Error("Failed to enter the new post page. please retry again.");
                }
            }
        }

        window.location.assign(`/${blogId}/posts/new`);
        // router.push("/posts/new");
    };

    return (
        <>
            <ToastContainer position='top-center' />
            <div className='container max-w-4xl mx-auto p-6'>
                <h2 className='text-2xl font-bold text-center mb-8'>전체 글</h2>

                {/* any 타입 나중에 수정 */}
                {posts?.map((post: PostResponse) => (
                    <PostItem
                        // 여기서 uuid를 사용하면 컴포넌트가 재렌더링 될때마다 새로운 key값이 생성되어 불필요한 재렌더링이 발생할 수 있기 때문에 uuid 사용 안함.
                        // 리스트에서 기존의 항목과 새롭게 추가된 항목을 구분함으로써 불필요한 재렌더링 방지를 위함
                        // uuid를 key값으로 사용하면 모든 리스트 아이템들의 key값이 매번 새롭게 생성되기 때문에, 매번 모든 리스트 요소들이 새롭게 추가되었다고 인식해서 불필요한 재렌더링이 발생하게 된다.
                        key={post.id}
                        postId={post.id}
                        title={post.title}
                        content={post.content}
                        createdAt={post.createdAt}
                        categoryName={post.categoryName}
                        postStatus={post.postStatus}
                        thumbnailUrl={
                            post.featuredImage
                                ? post.featuredImage.fileUrl
                                : "https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-featured-image.jpg"
                        }
                    />
                ))}

                {blogId === blogIdFromToken && <button onClick={handleNewPost}>글쓰기</button>}
            </div>
        </>
    );
}

export default BlogList;
