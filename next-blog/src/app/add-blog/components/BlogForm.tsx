"use client";

import React, { ChangeEvent, useState } from "react";
import QuillEditor from "./QuillEditor";
import PublishModal from "./PublishModal";

import useAddPost from "../../../hooks/useAddPost";

function BlogForm() {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const addPostMutation = useAddPost();

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handlePublishClick = () => {
        setIsModalOpen(true);   
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

   
    const handlePublish = (isPublic: boolean) => {


        console.log("실행");
        
        addPostMutation.mutate({
            title,
            content,
            isPublic,
            tags: [],
            category: '',
        }, {
            onSuccess: () => {
                handleCloseModal();
            }
        });
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

                {isModalOpen && <PublishModal onClose={handleCloseModal} onPublish={handlePublish}/>}
            </form>
        </div>
    );
}

export default BlogForm;
