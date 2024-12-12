"use client";

import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

// import { useGetPosts } from "@/customHooks/useGetPosts";
// import useCheckAccessToken from "@/customHooks/useCheckAccessToken";

import PostItem from "./PostItem";
import { PostResponse } from "@/types/PostTypes";
import { checkAccessToken } from "@/services/api";
import { refreshToken } from "@/utils/refreshToken";
import { useAuthStore } from "@/store/appStore";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";

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
    const { isInitialized } = useAuthStore();

    const TOKEN_KEY = "access_token";

    // 여러 사용자가 있을 때 해당 사용자 본인만 글쓰기를 볼 수 있음.
    useEffect(() => {
        if (isInitialized) {
            try {
                const token = localStorage.getItem(TOKEN_KEY);
                if (token) {
                    const decodedToken = jwtDecode<DecodedToken>(token);
                    setBlogIdFromToken(decodedToken.blogId);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, [isInitialized, blogIdFromToken]);

    // if (isValidToken) {
    //     // 토큰이 유효할 때 수정페이지로 접근
    //     // router.push를 쓰면 클라이언트 측에서 페이지 이동이 일어나기 때문에, 수정 페이지로 접근 시 페이지 전체가 새로고침 되지 않아 에디터 기능이 제대로 작동하지 않는다.
    //     // 따라서 수정 페이지로 이동할땐 window.location.href를 사용하여 수정 페이지 전체 새로고침이 일어나도록 한다.
    //     // router.push(`/posts/${postId}/edit`);
    //     window.location.assign(`/${blogId}/posts/${postId}/edit`);
    // }

    // if (isValidToken === false) {
    //     try {
    //         const newAccessToken = await refreshToken();
    //         if (newAccessToken) {
    //             // 토큰이 유효할 때 수정페이지로 접근
    //             // router.push(`/posts/${postId}/edit`);
    //             window.location.assign(`/${blogId}/posts/${postId}/edit`);
    //         }
    //     } catch (error: unknown) {
    //         if (error instanceof CustomHttpError) {
    //             localStorage.removeItem("access_token");

    //             toast.error(
    //                 <span>
    //                     <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
    //                 </span>,
    //                 {
    //                     onClose: () => {
    //                         window.location.reload();
    //                     },
    //                 }
    //             );
    //         }
    //     }
    // }

    const handleNewPost = async () => {
        // 토큰이 있어야만 애초에 글쓰기를 볼 수 있음. 주석처리
        // const token = localStorage.getItem(TOKEN_KEY);
        // if (!token) {
        //     router.push("/login"); // 로그인 안된 본인 처리
        //     return;
        // }
        const isValidToken = await checkAccessToken();

        if (isValidToken === null) {
            return;
        }

        if (isValidToken === false) {
            try {
                const newAccessToken = await refreshToken();
                if (newAccessToken) {
                    window.location.assign(`/${blogId}/posts/new`);
                    // router.push("/posts/new");
                }
            } catch (error: unknown) {
                if (error instanceof CustomHttpError) {
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
                }
            }
        } else if (isValidToken === true) {
            window.location.assign(`/${blogId}/posts/new`);
        }

    };

    return (
        <>
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
