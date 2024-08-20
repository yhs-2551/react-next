"use client"

import React, { ChangeEvent, useState } from 'react';
import QuillEditor from "./QuillEditor";
import PublishModal from "./PublishModal";


function BlogForm() {

    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }

    const handlePublishClick = () => {
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <fieldset>
                <legend>새로운 블로그 글 등록 폼</legend>
                <div className="mb-4">
                    <input className="w-full p-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600" type="text" value={title} required placeholder="제목을 입력하세요" onChange={handleTitleChange}/>
                </div>

                <div className="mb-4">
                    <QuillEditor value={content} onChange={setContent}/>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        onClick={handlePublishClick}
                    >
                        발행
                    </button>
                </div>
                {isModalOpen && <PublishModal onClose={handleCloseModal} />}
            </fieldset>
        </form>
    )
}

export default BlogForm
