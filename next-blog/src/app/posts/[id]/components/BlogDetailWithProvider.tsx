"use client";

import "@/app/posts/[id]/components/BlogDetailWithProvider.css"

import type { Post } from "@/common/types/Post";

import useDeletePost from "@/customHooks/useDeletePost";
import { useGetPost } from "@/customHooks/useGetPost";
import ClientWrapper from "@/providers/ClientWrapper";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast, ToastContainer } from "react-toastify";
import { checkAccessToken, fetchIsAuthor } from "@/services/api";
import DOMPurify from "dompurify";
import { UseMutationResult } from "react-query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function BlogDetail({ initialData, postId }: { initialData: Post; postId: string }) {
    const router: AppRouterInstance = useRouter();
    const accessToken: string | false = localStorage.getItem("access_token") ?? false;
    const [isAuthor, setIsAuthor] : [boolean, React.Dispatch<React.SetStateAction<boolean>>] = useState<boolean>(false); // 작성자 여부 상태

    const { data: post = initialData, isLoading, isError } = useGetPost(postId, initialData);

    // 일부 React Hook 특히 useEffect는 React Strict mode에서 두 번 실행 함. 끄고 싶다면 next.config.mjs에서 스트릭트 모드 off 해야함.
    // 새로고침 시 액세스 토큰 유효성 검사 확인하는 로직
    useEffect(() => {
        const validateTokenOnLoad: () => Promise<void> = async (): Promise<void> => {
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
        const fetchAuthorStatus: () => Promise<void> = async (): Promise<void> => {
            const isAuthorResponse = await fetchIsAuthor(postId);
            setIsAuthor(isAuthorResponse);
        };

        if (accessToken) {
            fetchAuthorStatus();
        }
    }, []);

    console.log("바깥쪽 실행");

     
    //dangerouslySetInnerHTML을 사용하여 HTML을 렌더링할 때, 다운로드 링크를 생성하는 로직
    //dangerouslySetInnerHTML은 HTML을 렌더링할 때 React가 관리하지 않기 때문에, React가 관여하지 않는 DOM 변화를 갖미하여 추가적인 작업(예: 다운로드 링크 생성)을 할 수 있다. 
    useEffect(() => {
        const setDownloadAttributes: () => void = (): void => {

            console.log("실행");

            const anchorTags: NodeListOf<HTMLAnchorElement> = document.querySelectorAll("a");
            let downloadAttributeSet: boolean = false;

            anchorTags?.forEach((anchorTag: HTMLAnchorElement) => {
                const fileUrl: string | null = anchorTag.getAttribute("href");

                if (fileUrl) {
                    const lastHyphenIndex = fileUrl.lastIndexOf("-");
                    const originalFileNameFromFileUrl = lastHyphenIndex !== -1 ? fileUrl.substring(lastHyphenIndex + 1) : fileUrl;

                    if (originalFileNameFromFileUrl && anchorTag.textContent?.includes("첨부된 파일:")) {
                        // Blob을 사용하여 다운로드 링크 생성
                        fetch(fileUrl)
                            .then(response => response.blob())
                            .then(blob => {
                                const url = window.URL.createObjectURL(blob); // Object URL 생성
                                anchorTag.setAttribute("href", url);
                                anchorTag.setAttribute("download", decodeURIComponent(originalFileNameFromFileUrl));
                                anchorTag.style.color = "#06c";
                                downloadAttributeSet = true;
                                // window.URL.revokeObjectURL(url); // Object URL 해제 여기서 하면 다운이 안됨 인터넷 오류 발생


                            })
                            .catch(console.error);
                    }
                } else {
                    console.log("Cannot find originalFileNameFromFileUrl and anchorTag.textContent >>>");
                }
            });

            
            // 다운로드 속성이 설정되면 observer를 해제
            if (downloadAttributeSet) {
                observer.disconnect();
            }

        };

        const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[], obs: MutationObserver): void => {
            setDownloadAttributes();
        });

        const targetNode: HTMLDivElement = document.querySelector(".container") as HTMLDivElement;
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    const deletePost: UseMutationResult<void, Error, string, unknown> = useDeletePost();

    const formattedDate: string = new Date(post.createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // 24-hour format
    });

    const handleEdit: () => Promise<void> = async (): Promise<void> => {
        if (!accessToken) {
            router.push("/login"); // 로그인 안된 사용자 처리
            return;
        }
        const isValidToken: boolean | undefined = await checkAccessToken();

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

    const handleDelete: () => void = (): void => {
        deletePost.mutate(postId);
    };

    // 비공개로 변경도 클릭 시 토큰 검증 위와 같이 필요
    const handlePostStatus: () => void = (): void => {
        alert(`Change privacy setting from ${post.postStatus}`);
    };

    return (
        <>
            <ToastContainer />
            <div className='container mx-auto p-6 max-w-4xl'>
                {/* Category and Date */}

                <span className='text-sm text-gray-500 mb-2'>카테고리: {post.categoryName || "없음"}</span>

                {/* Title */}
                <h1 className='text-3xl font-bold mt-3 mb-3'>{post.title}</h1>

                {/* space-x-4 자식 요소의 x축 간격을 1rem만큼 설정한다. space-x-4에서 4 = 1rem  */}
                <div className='flex space-x-4 mb-2'>
                    <span className='text-sm text-gray-500'>{formattedDate}</span>
                    <span className='text-sm text-gray-500'>{post.userName}</span>
                </div>
                {/* Action Buttons */}
                {isAuthor && (
                    <div className='flex space-x-4 mb-4'>
                        <button onClick={handleEdit} className='text-sm text-gray-500'>
                            수정
                        </button>
                        <button onClick={handlePostStatus} className='text-sm text-gray-500'>
                            {post.postStatus === "PUBLIC" ? "비공개로 변경" : "공개로 변경"}
                        </button>
                        <button onClick={handleDelete} className='text-sm text-gray-500'>
                            삭제
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className='text-gray-700' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}></div>
            </div>
        </>
    );
}

function BlogDetailWithProvider({ initialData, postId }: { initialData: Post; postId: string }) {
    return (
        <ClientWrapper>
            <BlogDetail initialData={initialData} postId={postId} />
        </ClientWrapper>
    );
}

export default BlogDetailWithProvider;
