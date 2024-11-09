import React, { ChangeEvent, useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import NextImage from "next/image";
import { FileMetadata } from "@/types/PostTypes";
import { uploadFile } from "@/utils/uploadFile";

interface PublishModalProps {
    // isOpen: boolean;
    onClose: () => void;
    // titleRef: React.RefObject<string>;
    // contentRef: React.RefObject<string>;
    onPublish: (postStatus: "PUBLIC" | "PRIVATE", commentsEnabled: "ALLOW" | "DISALLOW", featuredImage: FileMetadata | null | undefined) => void;
    errorMessageRef: React.RefObject<string>;
    totalFileRef: React.MutableRefObject<FileMetadata[]>;
    deletedImageUrlsInFutureRef: React.MutableRefObject<string[]>;
    fetchFeaturedImageFromServer?: FileMetadata | undefined;
}

function PublishModal({
    onClose,
    onPublish,
    errorMessageRef,
    totalFileRef,
    deletedImageUrlsInFutureRef,
    fetchFeaturedImageFromServer,
}: PublishModalProps) {
    const [commentsEnabled, setCommentsEnabled] = useState<"ALLOW" | "DISALLOW">("ALLOW");
    const [featuredImage, setFeaturedImage] = useState<FileMetadata | null | undefined>(fetchFeaturedImageFromServer);
    // const [fetchFeaturedImage, setFetchFeaturedImage] = useState<FileMetadata | null | undefined>(fetchFeaturedImageFromServer);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const MAX_TOTAL_SIZE_MB = 20;

    // let isPublishClick: boolean = false;

    console.log("totalFileRef.current >>>", totalFileRef.current);
    console.log("featuredImage >>>", featuredImage);

    const [postStatus, setPostStatus] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

    const handlePublish = () => {
        if ((totalFileRef.current && !(totalFileRef.current.length === 0)) || featuredImage) {
            const totalFileSize = totalFileRef.current.reduce((acc, file) => acc + file.fileSize, 0);
            const featuredImageSize = featuredImage?.fileSize;
            let totalSizeInMB: number = 0;
            if (featuredImageSize && totalFileSize) {
                // 대표 이미지와 첨부 파일 모두 있을 때
                totalSizeInMB = (totalFileSize + featuredImageSize) / (1024 * 1024);
            } else if (totalFileSize) {
                // 첨부 파일만 있을 때
                totalSizeInMB = totalFileSize / (1024 * 1024);
            } else if (featuredImageSize) {
                // 대표 이미지만 있을 때
                totalSizeInMB = featuredImageSize / (1024 * 1024);
            }
            console.log("totalFileSize >>>", totalSizeInMB);

            if (totalSizeInMB > MAX_TOTAL_SIZE_MB) {
                toast.error(`최대 ${MAX_TOTAL_SIZE_MB}MB까지 업로드할 수 있습니다.`);
                return;
            }
        }

        // isPublishClick = true;
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

        deletedImageUrlsInFutureRef.current = [...deletedImageUrlsInFutureRef.current, featuredImage?.fileUrl ?? ""];

        console.log("deletedImageUrlsInFutureRef >>>", deletedImageUrlsInFutureRef.current);
        // const deleteFile: (token: string | boolean) => Promise<Response> = async (token: string | boolean) => {
        //     return await fetch("http://localhost:8000/api/posts/file/delete-temp-featured-file", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             Authorization: `Bearer ${token}`,
        //         },
        //         body: JSON.stringify({ url: featuredImage?.fileUrl, featured: "featured" }),
        //     });
        // };

        // const accessToken: string | false = localStorage.getItem("access_token") ?? false;
        // let response = await deleteFile(accessToken);

        // if (!response.ok && response.status === 401) {
        //     const newAccessToken = await refreshToken();

        //     console.log("newAccessToken >>" + newAccessToken);

        //     if (newAccessToken) {
        //         response = await deleteFile(newAccessToken);
        //     }
        // }

        // if (!response.ok) {
        //     throw new Error("Failed to delete temporary featured file, please retry again.");
        // }
    };

    return (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center'>
            <div className='bg-white p-6 rounded-md shadow-md w-96'>
                <h2 className='text-2xl font-bold mb-4'>발행</h2>

                <div className='mb-4'>
                    <label className='block mb-2' htmlFor=''>
                        게시글 공개
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded-md' value={postStatus} onChange={handlePostStatusChange}>
                        <option value='PUBLIC'>공개</option>
                        <option value='PRIVATE'>비공개</option>
                    </select>
                </div>

                <div className='mb-4'>
                    <label className='block mb-2' htmlFor=''>
                        댓글 허용
                    </label>
                    <select className='w-full p-2 border border-gray-300 rounded-md' value={commentsEnabled} onChange={handleCommentsEnabledChange}>
                        <option value='ALLOW'>허용</option>
                        <option value='DISALLOW'>비허용</option>
                    </select>
                </div>

                <div className='mb-4 h-40 border border-gray-300 rounded-md relative bg-gray-100 flex justify-center items-center'>
                    {featuredImage ? (
                        <div className='relative w-[20.875rem] h-[9.875rem]'>
                            <NextImage
                                src={featuredImage.fileUrl}
                                alt='Representative Image'
                                className='rounded-md'
                                style={{ maxWidth: "100%", height: "auto" }}
                                width={334}  
                                height={158}  
                                priority={true}
                            />
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
                        className='w-[7rem] px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400'
                        onClick={handlePublish}
                    >
                        {postStatus === "PUBLIC" ? "공개 발행" : "비공개 저장"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PublishModal;
