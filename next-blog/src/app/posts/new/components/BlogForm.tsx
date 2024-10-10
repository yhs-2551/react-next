"use client";

import React, { ChangeEvent, useRef } from "react";

import PublishModal from "../../(common)/Modal/PublishModal";

import QuillEditor from "./QuillEditor/QuillEditor";
import useAddPost from "@/customHooks/useAddPost";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Tag {
    id: string;
    value: string;
}

function BlogForm() {

    const quillContentRef = useRef<() => string>(() => "");
    const modalRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<string>("");
    const titleRef = useRef<string>("");
    const errorMessageRef = useRef<string | null>(null);
    const addPostMutation = useAddPost();
    const router = useRouter();

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

    const handlePublish = (
        postStatus: string,
        tags: Tag[],
        category: string
    ) => {

        const content = contentRef.current;
        const title = titleRef.current;   

        console.log("컨텐츠 >>>>" + content);
        console.log("컨텐츠 >>>>" + title);

        addPostMutation.mutate(
            {
                title,
                content,
                postStatus,
                tags: tags.map((tag) => tag.value), // 태그 값만 전달
                categoryName: category,
            },
            {
                onSuccess: () => {

                    console.log("Blog 작성 성공 실행");

                    if (modalRef.current) {
                        modalRef.current.style.display = "none";
                    }

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

    return (
        <>
            <ToastContainer />

            <form onSubmit={(e) => e.preventDefault()} className=''>
                <fieldset className=''>
                    <legend className='sr-only'>
                        새로운 블로그 글 등록 폼
                    </legend>
                    <div className='mb-4 '>
                        <input
                            className='w-full p-2 focus:outline-none border-b'
                            type='text'
                            placeholder='제목을 입력하세요'
                            onChange={handleTitleChange}
                        />
                    </div>

                    {/* mb-4 flex-1 */}
                    <div className="ql-custom-container relative">
                        <QuillEditor
                            value={contentRef.current}
                            getEditorContent={(getContent) => {
                                quillContentRef.current = getContent;
                            }}
                        />
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
                <div ref={modalRef} className="hidden">
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
