"use client";

import React, { ChangeEvent, useState } from "react";

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
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addPostMutation = useAddPost();
  const router = useRouter();

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handlePublishClick = () => {
    setIsPublishModalOpen(true);
  };

  const handleCloseModal = () => {
    setErrorMessage(null);
    setIsPublishModalOpen(false);
  };

  const handlePublish = (postStatus: string, tags: Tag[], category: string) => {
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
          setIsPublishModalOpen(false);
          router.push("/posts");
        },
        onError: (error: any) => {
          console.log("Blog 작성 실패 실행");
          console.error("Error:", error); // 오류 로그 확인
          if (!(error.response.status === 401)) {
            setErrorMessage(error.message); // useAddPost에서  throw new Error로 던진 에러 메시지가 error.message에서 사용 된다.
          }
        },
      }
    );
  };

  return (
    <>
      <ToastContainer />

      <form onSubmit={(e) => e.preventDefault()} className="">

        <fieldset className="">
          <legend className="sr-only">새로운 블로그 글 등록 폼</legend>
          <div className="mb-4 ">
            <input
              className="w-full p-2 focus:outline-none border-b"
              type="text"
              value={title}
              placeholder="제목을 입력하세요"
              onChange={handleTitleChange}
            />
          </div>

          <div className="">
          <QuillEditor value={content} onChange={setContent} />
          </div>
        </fieldset>

        <button
          type="submit"
          className="absolute bottom-0 right-20 px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400"
          onClick={handlePublishClick}
        >
          발행
        </button>

        {/* {isModalOpen && <PublishModal onClose={handleCloseModal} onPublish={handlePublish}/>} */}
        {isPublishModalOpen && (
          <PublishModal
            isOpen={isPublishModalOpen}
            onClose={handleCloseModal}
            title={title}
            content={content}
            onPublish={handlePublish}
            errorMessage={errorMessage}
          />
        )}
      </form>
    </>
  );
}

export default BlogForm;
