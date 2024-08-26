"use client";

import React, { ChangeEvent, useState } from "react";


import QuillEditor from "@/app/posts/new/components/QuillEditor/QuillEditor";
 
import Modal from "@/app/posts/(common)/Modal/Modal";
import ClientWrapper from "@/providers/ClientWrapper";
import useUpdatePost from "@/customHooks/useUpdatePost";
import PublishModal from "@/app/posts/(common)/Modal/PublishModal";

interface Post {
    title: string;
    postStatus: "PUBLIC" | "PRIVATE";
    categoryName: string | null;
    createdAt: string;
    content: string;
}


function BlogEditForm({ initialData, postId}: { initialData: Post; postId: string }) {
    const [title, setTitle] = useState<string>(initialData.title);
    const [content, setContent] = useState<string>(initialData.content);
    const [isPublishModalOpen, setIsPublishModalOpen] =
        useState<boolean>(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] =
        useState<boolean>(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);

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

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
    };

    const handleCloseErrorModal = () => {
        setIsErrorModalOpen(false);
    };

    const handlePublish = (postStatus: string) => {
        updatePostMutation.mutate(
            {
                title,
                content,
                postStatus,
                tags: [],
                categoryName: "",
            },
            {
                onSuccess: () => {
                    console.log("Blog Edit Form 성공 실행");
                    
                    setIsPublishModalOpen(false);
                    setIsSuccessModalOpen(true);
                },
                onError: (error) => {
                    console.log("Blog Edit Form 실패 실행");
                    console.error("Error:", error); // 오류 로그 확인
                    setIsPublishModalOpen(false);
                    setIsErrorModalOpen(true); // 실패 모달 열기
                },
            }
        );
    };
    return (

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
                    onPublish={handlePublish}
                />
            )}

            <Modal
                isOpen={isSuccessModalOpen}
                onClose={handleCloseSuccessModal}
                title='발행 성공'
                content='포스트가 성공적으로 수정 되었습니다!'
            />
            <Modal
                isOpen={isErrorModalOpen}
                onClose={handleCloseErrorModal}
                title='발행 실패'
                content='수정 요청이 실패했습니다. 다시 시도해주세요.'
            />
        </form>

    );
}


function BlogDetailWithProvider({ initialData, postId }: { initialData: Post; postId: string }) {
    return (
        <ClientWrapper>
            <BlogEditForm initialData={initialData} postId={postId}/>
        </ClientWrapper>
    );
}

export default BlogDetailWithProvider;