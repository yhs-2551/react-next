"use client";

import React, { ChangeEvent, useEffect, useRef } from "react";

import { v4 as uuidv4 } from "uuid";

import PublishModal from "../../(common)/Modal/PublishModal";

import QuillEditor from "./QuillEditor/QuillEditor";
import useAddPost from "@/customHooks/useAddPost";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { refreshToken } from "../../(common)/utils/refreshToken";

interface Tag {
    id: string;
    value: string;
}

interface FileMetadata {
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
}

function BlogForm() {
    const quillContentRef = useRef<() => string>(() => "");

    const modalRef = useRef<HTMLDivElement | null>(null);

    const contentRef = useRef<string>("");
    const titleRef = useRef<string>("");
    const fileRef = useRef<FileMetadata[]>([]);

    const categoryRef = useRef<HTMLSelectElement>(null);
    const tags = useRef<Tag[]>([]);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const tagContainerRef = useRef<HTMLDivElement>(null);

    const errorMessageRef = useRef<string | null>(null);

    const addPostMutation = useAddPost();
    const router = useRouter();

    const uploadedImagesUrlRef: React.MutableRefObject<string[]> = useRef<string[]>([]);

    let isSaved = false;

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        titleRef.current = e.target.value; //  // 최신 title 값 가져오기

        console.log(titleRef.current);
    };

    const handlePublishClick = () => {
        contentRef.current = quillContentRef.current(); // 최신 content 값 가져오기

        console.log(contentRef.current);

        if (modalRef.current) {
            modalRef.current.style.display = "block";
        }
    };

    const handleCloseModal = () => {
        errorMessageRef.current = null;
        if (modalRef.current) {
            modalRef.current.style.display = "none";
        }
    };

    const handlePublish: (postStatus: "PUBLIC" | "PRIVATE", commentsEnabled: "ALLOW" | "DISALLOW", featuredImage: FileMetadata | null) => void = (
        postStatus: "PUBLIC" | "PRIVATE",
        commentsEnabled: "ALLOW" | "DISALLOW",
        featuredImage: FileMetadata | null
    ) => {
        const content = contentRef.current;
        const title = titleRef.current;
        const category = categoryRef.current?.value || "";

        console.log("타이틀 >>>>" + title);
        console.log("컨텐츠 >>>>" + content);

        console.log("postStatus >>>>" + postStatus);
        console.log("댓글 허용 여부 >>" + commentsEnabled);

        addPostMutation.mutate(
            {
                title,
                content,
                category,
                tags: tags.current.map((tag) => tag.value), // 태그 값만 전달
                files: fileRef.current,
                postStatus,
                commentsEnabled,
                featuredImage,
            },
            {
                onSuccess: () => {
                    console.log("Blog 작성 성공 실행");

                    if (modalRef.current) {
                        modalRef.current.style.display = "none";
                    }

                    isSaved = true;
                    router.push("/posts");
                },
                onError: (error: any) => {
                    console.log("Blog 작성 실패 실행");
                    console.error("Error:", error); // 오류 로그 확인
                    if (!(error.response.status === 401)) {
                        errorMessageRef.current = error.message; // useAddPost에서  throw new Error로 던진 에러 메시지가 error.message에서 사용 된다.
                        // 토큰이 만료된 에러인 401 에러가 아니면 인라인 메시지로 띄워주고, 토큰 만료 에러는 useAddPost에서 Toast 알림으로 처리.
                    }
                },
            }
        );
    };

    useEffect(() => {
        const deleteTempAllFiles = async (token: string | boolean) => {
            return await fetch("http://localhost:8000/api/posts/files/delete-temp-files", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ urls: uploadedImagesUrlRef.current }),
            });
        };

        const handleBeforeUnload: (e: BeforeUnloadEvent) => Promise<void> = async (e: BeforeUnloadEvent): Promise<void> => {
            e.preventDefault();
            if (isSaved) {
                return;
            } else {
                console.log("실행");

                const accessToken: string | false = localStorage.getItem("access_token") ?? false;
                let response = await deleteTempAllFiles(accessToken);
                if (!response.ok && response.status === 401) {
                    const newAccessToken = await refreshToken();

                    if (newAccessToken) {
                        response = await deleteTempAllFiles(newAccessToken);
                    }
                }

                if (!response.ok) {
                    throw new Error("Failed to delete all temporary files, please retry again.");
                }
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (tagInputRef.current && tagInputRef.current.value.trim()) {
                const inputValue = tagInputRef.current.value.trim();
                if (!inputValue.startsWith("#")) {
                    tagInputRef.current.value = `#${inputValue}`;
                }

                if (tags.current.length < 10) {
                    const newTag: Tag = {
                        id: uuidv4(),
                        value: tagInputRef.current.value,
                    };

                    tags.current = [...tags.current, newTag];
                    addTagToDOM(newTag);
                    tagInputRef.current.value = ""; // 입력 필드 초기화

                    if (tags.current.length >= 10 && tagInputRef.current) {
                        tagInputRef.current.style.display = "none";
                    }
                }
            }
        }
    };
    // const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    //     setCategory(e.target.value);
    // };

    const addTagToDOM = (tag: Tag) => {
        if (tagContainerRef.current) {
            const tagElement = document.createElement("span");
            tagElement.className = "inline-block text-xs mr-2 px-3 py-1";
            tagElement.textContent = tag.value;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "ml-2 text-xs text-gray-500";
            removeButton.textContent = "×";
            removeButton.onclick = () => removeTag(tag.id, tagElement);

            tagElement.appendChild(removeButton);
            tagContainerRef.current.appendChild(tagElement);
        }
    };

    const removeTag = (uuidToRemove: string, tagElement: HTMLElement) => {
        tags.current = tags.current.filter((tag) => tag.id !== uuidToRemove);
        if (tagContainerRef.current) {
            tagContainerRef.current.removeChild(tagElement);
        }

        if (tags.current.length < 10 && tagInputRef.current) {
            tagInputRef.current.style.display = "block";
        }
    };

    return (
        <>
            <ToastContainer />

            <form onSubmit={(e) => e.preventDefault()} className=''>
                <fieldset className=''>
                    <legend className='sr-only'>새로운 블로그 글 등록 폼</legend>

                    <div className='mb-4'>
                        <select ref={categoryRef} className='w-[20%] p-2 border border-gray-300 rounded-md'>
                            <option value=''>카테고리</option>
                            <option value='html'>HTML</option>
                            <option value='css'>CSS</option>
                            <option value='react'>React</option>
                            <option value='next.js'>Next.js</option>
                            <option value='spring'>Spring</option>
                            <option value='spring boot'>Spring Boot</option>
                        </select>
                    </div>

                    <div className='mb-4 '>
                        <input
                            className='w-full p-2 focus:outline-none border-b'
                            type='text'
                            placeholder='제목을 입력하세요'
                            onChange={handleTitleChange}
                        />
                    </div>

                    {/* mb-4 flex-1 */}
                    <div className='ql-custom-container relative'>
                        <QuillEditor
                            value={contentRef.current}
                            fileRef={fileRef}
                            getEditorContent={(getContent) => {
                                quillContentRef.current = getContent;
                            }}
                            uploadedImagesUrlRef={uploadedImagesUrlRef}
                        />
                    </div>

                    <div className='mb-4'>
                        <input
                            ref={tagInputRef}
                            className='w-full p-2 text-xs focus:outline-none'
                            type='text'
                            placeholder='#태그 입력 (,키 및 엔터키로 분리)'
                            onKeyDown={handleTagKeyDown}
                        />
                        <div ref={tagContainerRef} className='mt-2'></div>
                    </div>
                </fieldset>

                <button
                    type='submit'
                    className='absolute bottom-0 right-20 px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400'
                    onClick={handlePublishClick}
                >
                    완료
                </button>

                {/* {isModalOpen && <PublishModal onClose={handleCloseModal} onPublish={handlePublish}/>} */}
                <div ref={modalRef} className='hidden'>
                    <PublishModal
                        isOpen={true}
                        onClose={handleCloseModal}
                        titleRef={titleRef}
                        contentRef={contentRef}
                        onPublish={handlePublish}
                        errorMessageRef={errorMessageRef}
                    />
                </div>
            </form>
        </>
    );
}

export default BlogForm;
