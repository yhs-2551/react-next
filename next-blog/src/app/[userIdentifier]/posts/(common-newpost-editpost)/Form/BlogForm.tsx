"use client";

import React, { ChangeEvent, Suspense, useEffect, useRef } from "react";

import { v4 as uuidv4 } from "uuid";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PublishModal from "../Modal/PublishModal";

import useAddPost from "@/customHooks/useAddPost";
import { useParams, useRouter } from "next/navigation";
import { extractTextFromHtml } from "@/utils/extractTextFromHtml";
import useUpdatePost from "@/customHooks/useUpdatePost";
import { UseMutationResult } from "react-query";

import ClipLoader from "react-spinners/ClipLoader";

import "highlight.js/styles/atom-one-dark-reasonable.css";

import dynamic from "next/dynamic";
import { FileMetadata, PostRequest, PostResponse } from "@/types/PostTypes";

// QuillEditor 컴포넌트를 동적으로 임포트하면서 highlight.js도 함께 설정
const QuillEditor = dynamic(
    async () => {
        // highlight.js를 동적으로 임포트
        const hljs = (await import("highlight.js")).default;
        // highlight.js 설정
        hljs.configure({
            languages: ["javascript", "css", "html", "typescript"],
        });
        // 전역 hljs 설정 (Quill이 내부적으로 사용)
        // @ts-ignore
        window.hljs = hljs;

        // QuillEditor 컴포넌트 임포트
        return import("../QuillEditor/QuillEditor");
    },
    {
        ssr: false,
        // loading: () => <ClipLoader color='#000' loading={true} size={50} /> 나중에 구현 예정
    }
);

interface Tag {
    id: string;
    value: string;
}

// const CustomEditor = dynamic( () => import( '@/app/posts/new/components/CKEditor/CustomCKEditor' ), { ssr: false } );

function BlogForm({ initialData, postId }: { initialData?: PostResponse; postId?: string }) {
    const isEditingRef = useRef<boolean>(!!postId);

    const quillContentRef = useRef<() => string>(() => "");

    const modalRef = useRef<HTMLDivElement | null>(null);

    const contentRef = useRef<string | undefined>(initialData?.content);

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
    //수정 작업 시 서버로 삭제 된 태그를 전송해주기 위함.
    const editPageDeletedTags = useRef<string[]>([]);

    const errorMessageRef = useRef<string | null>(null);

    const router = useRouter();

    const addPostMutation = useAddPost();

    const params = useParams();
    const userIdentifier = params.userIdentifier as string;

    let updatePostMutation: UseMutationResult<any, unknown, PostRequest, unknown>;

    if (postId) {
        updatePostMutation = useUpdatePost(postId);
    }

    console.log("contentRef.current >>" + contentRef.current);

    useEffect(() => {
        if (titleInputRef.current && initialData?.title) {
            titleInputRef.current.value = initialData.title;
        }

        // const newTag: Tag = {
        //     id: uuidv4(),
        //     value: tagInputRef.current.value,
        // };

        // tags.current = [...tags.current, newTag];
        // addTagToDOM(newTag);

        if (initialData && initialData.tags) {
            initialData.tags.forEach((tag) => {
                const editPageTag: Tag = {
                    id: uuidv4(),
                    value: tag,
                };

                tags.current = [...tags.current, editPageTag];
                addTagToDOM(editPageTag);
            });

            if (tags.current.length >= 10 && tagInputRef.current) {
                tagInputRef.current.style.display = "none";
            }
        }
    }, []);

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (titleInputRef.current) {
            titleInputRef.current.value = e.target.value;
        }
    };

    const handleComplete = () => {
        // quillContentRef.current함수를 실행해서 DOMPurify.sanitize(html)로 정화?된 quill.innerhtml 즉 에디터 내의 모든 html 내용을 가져옴
        contentRef.current = quillContentRef.current();
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

    const handlePublish: (
        postStatus: "PUBLIC" | "PRIVATE",
        commentsEnabled: "ALLOW" | "DISALLOW",
        featuredImage: FileMetadata | null | undefined
    ) => void = (postStatus: "PUBLIC" | "PRIVATE", commentsEnabled: "ALLOW" | "DISALLOW", featuredImage: FileMetadata | null | undefined) => {
        // 최종 발행 시점에는 title및 content 값이 무조건 있어야 함.

        const title = titleInputRef.current!.value;
        const content = contentRef.current!;

        const category = categoryRef.current?.value || "";

        console.log("타이틀 >>>>" + title);
        console.log("컨텐츠 >>>>" + content);

        console.log("postStatus >>>>" + postStatus);
        console.log("댓글 허용 여부 >>" + commentsEnabled);

        const postData = {
            title,
            content,
            category,
            tags: tags.current?.map((tag) => tag.value), // 태그 값만 전달
            editPageDeletedTags: editPageDeletedTags.current, // 수정페이지에서 삭제된 태그 전송
            files: fileRef.current,
            deleteTempImageUrls: deletedImageUrlsInFutureRef.current,
            postStatus,
            commentsEnabled,
            featuredImage,
        };

        const onSuccess = async () => {
            console.log(isEditingRef.current ? "Blog Edit Form 성공 실행" : "Blog 작성 성공 실행");

            if (modalRef.current) {
                modalRef.current.style.display = "none";
            }

            if (isEditingRef.current) {
                router.replace(`/${userIdentifier}/posts/${postId}`);
            } else {
                // 글 작성시 rotuer.push를 쓰면 글 작성 성공하고 목록 페이지로 간 후에, 브라우저 뒤로가기를 통해 다시 글작성 페이지로 갈 경우 에디터가 제대로 작동하지 않음.

                // -- 아래는 글 수정 시 --
                // 수정 작업 후 상세 페이지로 이동한 상태에서 브라우저 뒤로가기를 했을때 다시 수정 페이지로 가지 않게 router.replace 사용.
                // 즉 replace로 이동하면서 브라우저 history에 바로 직전 수정 페이지를 남기지 않음.
                // 쉽게 replace는 뒤로가기를 했을때 전전 페이지로 간다고 보면 된다.
                router.replace(`/${userIdentifier}/posts`);
            }

            // 글 작성의 경우 글 작성 성공하고 글 목록 페이지로 이동 후에 글 목록 페이지 page.tsx에 서버 컴포넌트 재실행.
            // 글 수정의 경우 상세페이지 및 그 아래 leaf segment인 수정 페이지에 다시 접근할 시 수정 페이지의 서버 컴포넌트까지 재실행 됨
            router.refresh();
        };

        const onError = (error: any) => {
            console.log(isEditingRef.current ? "Blog Edit Form 실패 실행" : "Blog 작성 실패 실행");
            console.error("Error:", error); // 오류 로그 확인
            errorMessageRef.current = error.message; // useAddPost 또는 useUpdatePost에서 throw new Error로 던진 에러 메시지가 error.message에서 사용 된다.
        };

        // 글 수정 같은 경우에는 글 작성자 ID와 토큰 Id값을 비교해서 백엔드에서 검증 처리를 할 수 있지만, 글 생성 같은 경우에는 글 작성자 ID가 없기 때문에 경로 파라미터인 userIdentifier를 사용하여 백엔드에서 검증 처리를 한다.
        if (isEditingRef.current) {
            updatePostMutation.mutate(postData, { onSuccess, onError });
        } else {
            addPostMutation.mutate({ newPost: postData, userIdentifier }, { onSuccess, onError });
        }
    };

    const removeTag = (uuidToRemove: string, tagElement: HTMLElement) => {
        // 태그 삭제시 initialData가 있다면 수정 페이지에서 태그를 삭제하는 경우가 됨. 즉 수정 페이지인지 식별하기 위함
        if (initialData) {
            const removedTag = tags.current.find((tag) => tag.id === uuidToRemove);
            if (removedTag) {
                editPageDeletedTags.current.push(removedTag.value);
            }
        }

        console.log("editPageDeletedTags.current >>", editPageDeletedTags.current);

        tags.current = tags.current.filter((tag) => tag.id !== uuidToRemove);
        if (tagContainerRef.current) {
            tagContainerRef.current.removeChild(tagElement);
        }

        if (tags.current.length < 10 && tagInputRef.current) {
            tagInputRef.current.style.display = "block";
        }
    };

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

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (tagInputRef.current && tagInputRef.current.value.trim()) {
                const inputValue = tagInputRef.current.value.trim();
                if (!inputValue.startsWith("#")) {
                    tagInputRef.current.value = `#${inputValue}`;
                }

                // 중복 태그 오류 처리. 두번째 입력부터 검증
                if (tags.current.length > 0) {
                    const isExist = tags.current.some((tag) => tag.value === tagInputRef.current?.value.trim());

                    if (isExist) {
                        toast.error(
                            <span>
                                <span style={{ fontSize: "1.1rem" }}>!</span>&nbsp;&nbsp;&nbsp;&nbsp;이미 존재하는 태그입니다.
                            </span>
                        );

                        tagInputRef.current.value = ""; // 입력 필드 초기화
                        return;
                    }
                }

                if (tags.current.length < 10) {
                    const newTag: Tag = {
                        // 태그를 삭제할때 고유 id값이 필요해서 id값 설정.
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
                            contentValue={contentRef.current}
                            fileRef={fileRef}
                            totalUploadedImagesUrlRef={totalUploadedImagesUrlRef}
                            deletedImageUrlsInFutureRef={deletedImageUrlsInFutureRef}
                            getEditorContent={(getContent) => {
                                quillContentRef.current = getContent;
                            }}
                            fetchFileFromServer={initialData?.files}
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
                    className='absolute bottom-0 right-20 px-4 py-2 bg-[#333] text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400'
                    onClick={handleComplete}
                >
                    완료
                </button>

                <div ref={modalRef} className='hidden'>
                    <PublishModal
                        onClose={handleCloseModal}
                        onPublish={handlePublish}
                        errorMessageRef={errorMessageRef}
                        totalFileRef={fileRef}
                        deletedImageUrlsInFutureRef={deletedImageUrlsInFutureRef}
                        fetchFeaturedImageFromServer={initialData?.featuredImage}
                    />
                </div>
            </form>
        </>
    );
}

export default BlogForm;
