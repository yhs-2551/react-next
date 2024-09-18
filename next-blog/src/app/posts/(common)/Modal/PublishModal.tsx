import React, { ChangeEvent, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import { extractTextFromHtml } from "@/utils/extractTextFromHtml";


interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    onPublish: (postStatus: string, tags: Tag[], category: string) => void;
    errorMessage: string | null;
}

interface Tag {
    id: string;
    value: string;
}

function PublishModal({
    isOpen,
    onClose,
    title,
    content,
    onPublish,
    errorMessage,
}: PublishModalProps) {
    const [postStatus, setPostStatus] = useState<string>("PUBLIC");
    const [tags, setTags] = useState<Tag[]>([]);
    const [tagInputValue, setTagInputValue] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [titleError, setTitleError] = useState<string | null>(null);
    const [contentError, setContentError] = useState<string | null>(null);

    const handlePublish = () => {
        let hasError = false;

        const textContent = extractTextFromHtml(content).trim();

        if (!title.trim()) {
            setTitleError("제목을 입력해주세요.");
            hasError = true;
        } else if (!textContent) {
            setContentError("내용을 입력해주세요.");
            hasError = true;
        }

        // 위쪽에 에러가 있으면 서버 요청을 하지 않음. 이유는 React Quill 에디터에서 내용을 입력하지 않아도 p태그와 br태그가 같이 들어가기 때문.
        if (hasError) {
            return;
        }

        onPublish(postStatus, tags, category);
    };

    const handlePostStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setPostStatus(e.target.value);
    };

    const handleSetTags = (e: ChangeEvent<HTMLInputElement>) => {
        setTagInputValue(e.target.value);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (tagInputValue.trim()) {
                const newTag: Tag = {
                    id: uuidv4(),
                    value: tagInputValue,
                };

                setTags([...tags, newTag]);
                setTagInputValue("");
            }
        }
    };

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
    };

    const removeTag = (uuidToRemove: string) => {
        setTags(tags.filter((tag) => tag.id !== uuidToRemove));
    };

    return (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center'>
                <div className='bg-white p-6 rounded-md shadow-md w-96'>
                    <h2 className='text-2xl font-bold mb-4'>발행 설정</h2>

                    <div className='mb-4'>
                        <label className='block mb-2'>카테고리 선택</label>
                        <select
                            className='w-full p-2 border border-gray-300 rounded-md'
                            value={category}
                            onChange={handleCategoryChange}
                        >
                            <option value=''>카테고리 선택</option>
                            <option value='html'>HTML</option>
                            <option value='css'>CSS</option>
                            <option value='react'>React</option>
                            <option value='next.js'>Next.js</option>
                            <option value='spring'>Spring</option>
                            <option value='spring boot'>Spring Boot</option>
                        </select>
                    </div>

                    <div className='mb-4'>
                        <label className='block mb-2'>태그 입력</label>
                        <input
                            className='w-full p-2 border border-gray-300 rounded-md'
                            type='text'
                            placeholder='태그 입력 (,및 엔터 입력으로 분리)'
                            value={tagInputValue}
                            onChange={handleSetTags}
                            onKeyDown={handleTagKeyDown}
                        />

                        <div className='mt-2'>
                            {tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className='inline-block bg-gray-200 text-gray-800 text-sm font-semibold mr-2 px-3 py-1 rounded-full'
                                >
                                    {tag.value}
                                    <button
                                        type='button'
                                        onClick={() => removeTag(tag.id)}
                                        className='ml-2 text-gray-500 hover:text-gray-700'
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className='mb-4'>
                        <label className='block mb-2' htmlFor=''>
                            공개 여부
                        </label>
                        <select
                            className='w-full p-2 border border-gray-300 rounded-md'
                            value={postStatus}
                            onChange={handlePostStatusChange}
                        >
                            <option value='PUBLIC'>PUBLIC</option>
                            <option value='PRIVATE'>PRIVATE</option>
                        </select>
                    </div>

                    {titleError && (
                        <p className='text-sm text-red-500 mt-2'>
                            {titleError}
                        </p>
                    )}
                    {contentError && (
                        <p className='text-sm text-red-500 mt-2'>
                            {contentError}
                        </p>
                    )}
                    {errorMessage && (
                        <p className='text-sm text-red-500 mb-4'>
                            {errorMessage}
                        </p>
                    )}

                    <div className='flex justify-end'>
                        <button
                            className='px-4 py-2 bg-white text-black rounded-lg mr-2 focus:outline-none hover:bg-red-500 hover:text-white active:bg-red-400 border
                        border-gray-300'
                            onClick={onClose}
                        >
                            취소
                        </button>
                        <button
                            className='px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400'
                            onClick={handlePublish}
                        >
                            발행
                        </button>
                    </div>
                </div>
            </div>
    );
}

export default PublishModal;
