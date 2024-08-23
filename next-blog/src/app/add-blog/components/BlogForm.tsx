"use client";

import React, { ChangeEvent, useState } from "react";
import QuillEditor from "./QuillEditor";
import PublishModal from "./Modal/PublishModal";

import useAddPost from "../../../hooks/useAddPost";
import Modal from "./Modal/Modal";

function BlogForm() {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [isPublishModalOpen, setIsPublishModalOpen] =
        useState<boolean>(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] =
        useState<boolean>(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);

    const addPostMutation = useAddPost();

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

        addPostMutation.mutate(
            {
                title,
                content,
                postStatus,
                tags: [],
                category: "",
            },
            {
                onSuccess: () => {
                    console.log("실행ㅇㅇ");
                    setIsPublishModalOpen(false);
                    setIsSuccessModalOpen(true);
                },
                onError: (error) => {
                    console.log("실행");
                    console.error("Error:", error);  // 오류 로그 확인
                    setIsPublishModalOpen(false);
                    setIsErrorModalOpen(true);  // 실패 모달 열기
                },
            }
        );
    };
    return (
        <div className='h-screen flex flex-col'>
            <form
                onSubmit={(e) => e.preventDefault()}
                className='flex flex-col flex-1'
            >
                <fieldset className='flex-1 flex flex-col'>
                    <legend className='sr-only'>
                        새로운 블로그 글 등록 폼
                    </legend>
                    <div className='mb-4 '>
                        <input
                            className='w-full p-2 focus:outline-none border border-gray-300 rounded-md'
                            type='text'
                            value={title}
                            placeholder='제목을 입력하세요'
                            onChange={handleTitleChange}
                        />
                    </div>

                    <div className='mb-4 flex-1'>
                        <QuillEditor value={content} onChange={setContent} />
                    </div>
                </fieldset>

                <button
                    type='submit'
                    className='absolute top-6 right-20 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600'
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
                    content='포스트가 성공적으로 요청되었습니다!'
                />
                <Modal
                    isOpen={isErrorModalOpen}
                    onClose={handleCloseErrorModal}
                    title='발행 실패'
                    content='포스트 요청이 실패했습니다. 다시 시도해주세요.'
                />
            </form>
        </div>
    );
}

export default BlogForm;
