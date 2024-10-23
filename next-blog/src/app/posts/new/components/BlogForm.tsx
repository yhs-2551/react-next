// 중복된 태그명 있을 경우 toast 알림창 띄어주기

"use client";

import React, { ChangeEvent, useEffect, useRef } from "react";

import { v4 as uuidv4 } from "uuid";

import { toast, ToastContainer } from "react-toastify";

import PublishModal from "../../(common)/Modal/PublishModal";

import QuillEditor from "./QuillEditor/QuillEditor";
import useAddPost from "@/customHooks/useAddPost";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { extractTextFromHtml } from "@/utils/extractTextFromHtml";
import type { FileMetadata } from "@/common/types/PostTypes";

interface Tag {
    id: string;
    value: string;
}

// const CustomEditor = dynamic( () => import( '@/app/posts/new/components/CKEditor/CustomCKEditor' ), { ssr: false } );

function BlogForm() {
    const quillContentRef = useRef<() => string>(() => "");

    const modalRef = useRef<HTMLDivElement | null>(null);

    const contentRef = useRef<string>("");

    // const titleRef = useRef<string>(""); 과 같이 사용할 수 있지만 수정 페이지와 일관성을 위해 아래와 같이 사용
    const titleInputRef = useRef<HTMLInputElement | null>(null);

    // 최종 발행 시 서버로 전송할 파일 Ref
    const fileRef = useRef<FileMetadata[]>([]);
    // 사용자가 뒤로가기 및 새로고침 등의 페이지를 나갈 때 클라우드 스토리지에 임시로 저장된 전체 파일을 삭제하기 위한 Ref
    const totalUploadedImagesUrlRef: React.MutableRefObject<string[]> = useRef<string[]>([]);

    const deletedImageUrlsInFutureRef: React.MutableRefObject<string[]> = useRef<string[]>([]);

    const categoryRef = useRef<HTMLSelectElement>(null);
    const tags = useRef<Tag[]>([]);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const tagContainerRef = useRef<HTMLDivElement>(null);

    const errorMessageRef = useRef<string | null>(null);
    const addPostMutation = useAddPost();
    const router = useRouter();

    // let isSaved = false;

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (titleInputRef.current) {
            titleInputRef.current.value = e.target.value;
        }
    };

    const handleComplete = () => {
        contentRef.current = quillContentRef.current(); // 최신 content 값 가져오기
        const title = titleInputRef.current?.value || "";
        const content = contentRef.current || "";

        let hasError = false;

        const textContent = extractTextFromHtml(content).trim();

        console.log("textContent >>" + textContent);

        if (!title.trim()) {
            toast.error(
                <span>
                    <span style={{ fontSize: "1.1rem" }}>!</span>&nbsp;&nbsp;&nbsp;&nbsp;제목을 입력해주세요.
                </span>
            );
            hasError = true;
        } else if (!textContent) {
            toast.error(
                <span>
                    <span style={{ fontSize: "1.1rem" }}>!</span>&nbsp;&nbsp;&nbsp;&nbsp;내용을 입력해주세요.
                </span>
            );
            hasError = true;
        }

        // 위쪽에 에러가 있으면 서버 요청을 하지 않음. 이유는 React Quill 에디터에서 내용을 입력하지 않아도 p태그와 br태그가 같이 들어가기 때문.
        if (hasError) {
            return;
        }

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
        // 최종 발행 시점에는 title및 content 값이 무조건 있어야 함.
        let title = "";
        if (titleInputRef.current) {
            title = titleInputRef.current.value;
        }
        const content = contentRef.current;
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
                tags: tags.current?.map((tag) => tag.value), // 태그 값만 전달
                files: fileRef.current,
                deleteTempImageUrls: deletedImageUrlsInFutureRef.current,
                postStatus,
                commentsEnabled,
                featuredImage,
            },
            {
                onSuccess: async () => {
                    console.log("Blog 작성 성공 실행");

                    if (modalRef.current) {
                        modalRef.current.style.display = "none";
                    }

                    router.push("/posts");
                    // 글 작성 성공하고 글 목록 페이지로 이동 후에 글 목록 페이지 page.tsx에 서버 컴포넌트 재실행.
                    router.refresh();

                    // isSaved = true;

                    // console.log("실행");

                    // const accessToken: string | false = localStorage.getItem("access_token") ?? false;
                    // let response = await deleteTempAllFiles(accessToken, deletedImageUrlsInFutureRef.current);
                    // if (!response.ok && response.status === 401) {
                    //     const newAccessToken = await refreshToken();

                    //     if (newAccessToken) {
                    //         response = await deleteTempAllFiles(newAccessToken, deletedImageUrlsInFutureRef.current);
                    //     }
                    // }

                    // if (!response.ok) {
                    //     throw new Error("Failed to delete all temporary files, please retry again.");
                    // }
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

    // 나중에 임시저장 할때 처리
    // useEffect(() => {

    //     const handleBeforeUnload: (e: BeforeUnloadEvent) => Promise<void> = async (e: BeforeUnloadEvent): Promise<void> => {
    //         e.preventDefault();

    //         if (isSaved) return;

    //             console.log("실행");

    //             const accessToken: string | false = localStorage.getItem("access_token") ?? false;
    //             let response = await deleteTempAllFiles(accessToken, totalUploadedImagesUrlRef.current);
    //             if (!response.ok && response.status === 401) {
    //                 const newAccessToken = await refreshToken();

    //                 if (newAccessToken) {
    //                     response = await deleteTempAllFiles(newAccessToken, totalUploadedImagesUrlRef.current);
    //                 }
    //             }

    //             if (!response.ok) {
    //                 throw new Error("Failed to delete all temporary files, please retry again.");
    //             }

    //     };

    //     window.addEventListener("beforeunload", handleBeforeUnload);

    //     return () => {
    //         window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    // }, []);

    // const deleteTempAllFiles = async (token: string | boolean, deleteTempAllFileUrl: string[]) => {
    //     return await fetch("http://localhost:8000/api/posts/files/delete-temp-files", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${token}`,
    //         },
    //         body: JSON.stringify({ urls: deleteTempAllFileUrl }),
    //     });
    // };

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
            <ToastContainer position='top-center' />

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
                            ref={titleInputRef}
                            className='w-full p-2 focus:outline-none border-b'
                            type='text'
                            placeholder='제목을 입력하세요'
                            onChange={handleTitleChange}
                        />
                    </div>


                    {/* mb-4 flex-1 */}
                    <div className='ql-custom-container relative min-h-[500px]'>
                        <QuillEditor
                            value={contentRef.current}
                            fileRef={fileRef}
                            totalUploadedImagesUrlRef={totalUploadedImagesUrlRef}
                            deletedImageUrlsInFutureRef={deletedImageUrlsInFutureRef}
                            getEditorContent={(getContent) => {
                                quillContentRef.current = getContent;
                            }}
                        />
                    </div>

                    {/* <CustomEditor /> */}

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
                    onClick={handleComplete}
                >
                    완료
                </button>

                {/* {isModalOpen && <PublishModal onClose={handleCloseModal} onPublish={handlePublish}/>} */}
                <div ref={modalRef} className='hidden'>
                    <PublishModal
                        // isOpen={true}
                        onClose={handleCloseModal}
                        // titleRef={titleRef}
                        // contentRef={contentRef}
                        onPublish={handlePublish}
                        errorMessageRef={errorMessageRef}
                        totalFileRef={fileRef}
                        deletedImageUrlsInFutureRef={deletedImageUrlsInFutureRef}
                    />
                </div>
            </form>
        </>
    );
}

export default BlogForm;
