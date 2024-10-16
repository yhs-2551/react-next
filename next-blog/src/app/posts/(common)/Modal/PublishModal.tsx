import React, { ChangeEvent, useRef, useState } from "react";

import { extractTextFromHtml } from "@/utils/extractTextFromHtml";
import { uploadFile } from "../utils/uploadFile";
import { refreshToken } from "../utils/refreshToken";

interface FileMetadata {
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
}

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    titleRef: React.RefObject<string>;
    contentRef: React.RefObject<string>;
    onPublish: (postStatus: "PUBLIC" | "PRIVATE", commentsEnabled: "ALLOW" | "DISALLOW", featuredImage: FileMetadata | null) => void;
    errorMessageRef: React.RefObject<string>;
}

function PublishModal({ isOpen, onClose, titleRef, contentRef, onPublish, errorMessageRef }: PublishModalProps) {
    const [commentsEnabled, setCommentsEnabled] = useState<"ALLOW" | "DISALLOW">("ALLOW");
    const [featuredImage, setFeaturedImage] = useState<FileMetadata | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [postStatus, setPostStatus] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
    const [titleError, setTitleError] = useState<string | null>(null);
    const [contentError, setContentError] = useState<string | null>(null);

    const handlePublish = () => {
        let hasError = false;

        const title = titleRef.current || "";
        const content = contentRef.current || "";
        console.log("content >>" + content);

        console.log("title >>" + title);

        const textContent = extractTextFromHtml(content).trim();

        console.log("textContent >>" + textContent);

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
        onPublish(postStatus, commentsEnabled, featuredImage);
    };

    const handlePostStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as "PUBLIC" | "PRIVATE";
        setPostStatus(value);
    };

    const handleCommentsEnabledChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as "ALLOW" | "DISALLOW";
        setCommentsEnabled(value);
    };

    const handleImageSelectClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = await uploadFile(file, "featured");
            setFeaturedImage({
                fileName: file.name,
                fileType: file.type,
                fileUrl: imageUrl,
                fileSize: file.size,
            });
        }
    };

    const handleImageRemove = async () => {
        setFeaturedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // 파일 입력 초기화
        }

        const deleteFile: (token: string | boolean) => Promise<Response> = async (token: string | boolean) => {
            return await fetch("http://localhost:8000/api/posts/file/delete-temp-featured-file", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ url: featuredImage, featured: "featured" }),
            });
        };

        const accessToken: string | false = localStorage.getItem("access_token") ?? false;
        let response = await deleteFile(accessToken);

        if (!response.ok && response.status === 401) {
            const newAccessToken = await refreshToken();

            console.log("newAccessToken >>" + newAccessToken);

            if (newAccessToken) {
                response = await deleteFile(newAccessToken);
            }
        }

        if (!response.ok) {
            throw new Error("Failed to delete temporary featured file, please retry again.");
        }
    };

    return (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center'>
            <div className='bg-white p-6 rounded-md shadow-md w-96'>
                <h2 className='text-2xl font-bold mb-4'>발행</h2>

                <div className='mb-4'>
                    <label className='block mb-2' htmlFor=''>
                        공개 여부
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded-md' value={postStatus} onChange={handlePostStatusChange}>
                        <option value='PUBLIC'>공개</option>
                        <option value='PRIVATE'>비공개</option>
                    </select>
                </div>

                <div className='mb-4'>
                    <label className='block mb-2' htmlFor=''>
                        댓글 허용 여부
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded-md' value={commentsEnabled} onChange={handleCommentsEnabledChange}>
                        <option value='ALLOW'>허용</option>
                        <option value='DISALLOW'>비허용</option>
                    </select>
                </div>

                <div className='mb-4 h-40 border border-gray-300 rounded-md relative bg-gray-100 flex justify-center items-center'>
                    {featuredImage ? (
                        <div className='relative w-full h-full'>
                            <img src={featuredImage.fileUrl} alt='Selected' className='w-full h-full object-cover rounded-md' />
                            <button
                                onClick={handleImageRemove}
                                className='absolute top-0 right-0 p-1 bg-black text-white z-10 rounded-sm w-6 h-6 flex items-center justify-center'
                            >
                                &#8722;
                            </button>
                        </div>
                    ) : (
                        <button className='text-gray-400 flex flex-col items-center justify-center w-full h-full' onClick={handleImageSelectClick}>
                            <span className='text-2xl'>+</span>
                            <span className='text-sm'>대표 이미지 추가</span>
                        </button>
                    )}
                    <input type='file' ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
                </div>

                {titleError && <p className='text-sm text-red-500 mt-2'>{titleError}</p>}
                {contentError && <p className='text-sm text-red-500 mt-2'>{contentError}</p>}
                {errorMessageRef.current && <p className='text-sm text-red-500 mb-4'>{errorMessageRef.current}</p>}

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
                        공개 발행
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PublishModal;
