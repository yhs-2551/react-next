"use client";

import type { Post } from "@/common/types/Post";

import React, { ChangeEvent, useState } from "react";

import QuillEditor from "@/app/posts/new/components/QuillEditor/QuillEditor";

import ClientWrapper from "@/providers/ClientWrapper";
import useUpdatePost from "@/customHooks/useUpdatePost";
import PublishModal from "@/app/posts/(common)/Modal/PublishModal";
import { useRouter } from "next/navigation";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Tag {
    id: string;
    value: string;
}

function BlogEditForm({
    initialData,
    postId,
}: {
    initialData: Post;
    postId: string;
}) {
    const router = useRouter();

    const [title, setTitle] = useState<string>(initialData.title);
    const [content, setContent] = useState<string>(initialData.content);
    const [isPublishModalOpen, setIsPublishModalOpen] =
        useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const updatePostMutation = useUpdatePost(postId);

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handlePublishClick = () => {
        setIsPublishModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsPublishModalOpen(false);
    };

    const handlePublish = (
        postStatus: string,
        tags: Tag[],
        category: string
    ) => {
        updatePostMutation.mutate(
            {
                title,
                content,
                postStatus,
                tags: tags.map((tag) => tag.value), // 태그 값만 전달
                categoryName: category,
            },
            {
                onSuccess: () => {
                    console.log("Blog Edit Form 성공 실행");
                    setIsPublishModalOpen(false);
                    setTimeout(() => {
                        router.refresh(); // 수정 후 서버 컴포넌트 page.tsx에서 서버액션으로 다시 데이터를 가져오기 위함. 모달이 닫히고 0.1초뒤에 refresh
                    }, 100);
                    // setTimeout 지정 안하고 바로 router.push 하면 router.refresh()가 실행 안되고 묻힘.
                    setTimeout(() => {
                        router.push(`/posts/${postId}`);
                    }, 300); // 약간의 지연을 줘서 refresh 이후에 push가 실행되도록
                },
                onError: (error: any) => {
                    console.log("Blog Edit Form 실패 실행");
                    console.error("Error:", error); // 오류 로그 확인
                    if (!(error.response.status === 401)) {
                        setErrorMessage(error.message); // useUpdatePost에서  throw new Error로 던진 에러 메시지가 error.message에서 사용 된다.
                        // 토큰이 만료된 에러인 401 에러가 아니면 인라인 메시지로 띄워주고, 토큰 만료 에러는 useUpdatePost에서 Toast 알림으로 처리했다.
                    }
                },
            }
        );
    };
    return (
        <>
            <ToastContainer />
            <form onSubmit={(e) => e.preventDefault()} className=''>
                <fieldset className=''>
                    <legend className='sr-only'>블로그 글 수정 폼</legend>
                    <div className='mb-4 '>
                        <input
                            className='w-full p-2 focus:outline-none border-b'
                            type='text'
                            value={title}
                            placeholder='제목을 입력하세요'
                            onChange={handleTitleChange}
                        />
                    </div>

                    {/* mb-4 flex-1 */}
                    <div className=''>
                        <QuillEditor value={content} onChange={setContent} />
                    </div>
                </fieldset>

                <button
                    type='submit'
                    className='absolute bottom-0 right-20 px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400'
                    onClick={handlePublishClick}
                >
                    발행
                </button>

                {/* {isModalOpen && <PublishModal onClose={handleCloseModal} onPublish={handlePublish}/>} */}
                {isPublishModalOpen && (
                    <PublishModal
                        isOpen={isPublishModalOpen}
                        onClose={handleCloseModal}
                        title={title}
                        content={content}
                        onPublish={handlePublish}
                        errorMessage={errorMessage}
                    />
                )}
            </form>
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
            <BlogEditForm initialData={initialData} postId={postId} />
        </ClientWrapper>
    );
}

export default BlogDetailWithProvider;
