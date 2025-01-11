"use client";

import "./BlogDetail.css";

import "react-quill-new/dist/quill.snow.css"; // Snow 테마 CSS 파일

import parse, { DOMNode, Element } from "html-react-parser";

import Zoom from "react-medium-image-zoom";

import useDeletePost from "@/customHooks/useDeletePost";

import React, { useEffect, useRef, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { toast, ToastContainer } from "react-toastify";
import { checkAccessToken, fetchIsAuthor, refreshToken } from "@/services/api";

import NextImage from "next/image";
import { FileMetadata, PostResponse } from "@/types/PostTypes";
import DOMPurify from "dompurify";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { useAuthStore } from "@/store/appStore";
import ToastProvider from "@/providers/ToastProvider";

import {
    revalidateCategories,
    revalidateInfiniteScroll,
    revalidatePagination,
    revalidatePostDetailPage,
    revalidatePostEditPage,
    revalidatePostsAndSearch,
    revalidatePostsCategories,
    revalidatePostsCategoriesPagination,
} from "@/actions/revalidate";
import ConfirmModal from "@/app/_components/modal/ConfirmModal";
import DeleteModal from "@/app/_components/modal/DeleteModal";

function BlogDetail({ initialData, postId }: { initialData: PostResponse; postId: string }) {
    const [isAuthor, setIsAuthor]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = useState<boolean>(false); // 작성자 여부 상태
    const [parsedContent, setParsedContent] = useState<React.ReactNode | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const params = useParams();
    const blogId = params.blogId as string;

    const post = initialData;

    const router = useRouter();

    const { isInitialized } = useAuthStore();

    const parseStyleString = (style: string) => {
        return style.split(";").reduce((acc: { [key: string]: string | number }, styleProperty) => {
            const [key, value] = styleProperty.split(":");
            if (key && value) {
                const camelCasedKey = key.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
                acc[camelCasedKey] = value.trim();
            }
            return acc;
        }, {});
    };

    const getImageSize = (src: string) => {
        const file = post.files?.find((file: FileMetadata) => file.fileUrl === src);
        if (file) {
            return { width: file.width || 880, height: file.height || 495 };
        }
        return { width: 880, height: 495 }; // 기본값
    };

    useEffect(() => {
        const parseContent = (htmlString: string) => {
            // 이미지 태그가 포함되어 있는지 확인. 이미지 태그가 없다면 굳이 아래 서버로부터 이미지 크기 가져와서 Next 이미지 변환 로직을 실행할 필요가 없음.
            // DOM에서 이미지는 <img src~~와 같이 시작하기 때문에 <img로 선택
            if (!htmlString.includes("<img")) {
                return parse(DOMPurify.sanitize(htmlString)); // xss 공격 방지.
            }

            // html을 react 컴포넌트로 변환하는 html-react-parser 라이브러리 사용
            return parse(DOMPurify.sanitize(htmlString), {
                replace: (domNode: DOMNode) => {
                    if (domNode instanceof Element && domNode.name === "img") {
                        const { src, alt, style } = domNode.attribs;

                        console.log("style >>", style);

                        // 서버에서 받은 이미지 크기 정보를 가져오기
                        const { width, height } = getImageSize(src);

                        console.log("width >>>" + width);
                        console.log("height >>>" + height);

                        // 스타일을 객체로 변환하여 React의 style 속성에 적용 가능하도록 만듦
                        let styleAttributes = {};
                        if (style) {
                            styleAttributes = parseStyleString(style);
                        }

                        // 서버에서 받은 width, height 값을 기존 스타일에 병합
                        const finalStyle = {
                            ...styleAttributes,
                            width: `${width}px`, // width와 height를 명시적으로 추가하여 스타일에 포함
                            height: `${height}px`,
                        };

                        console.log("finalStyle >>>", finalStyle);

                        return (
                            <Zoom>
                                <NextImage
                                    key={src}
                                    src={src}
                                    alt={alt || "detail page image"}
                                    width={width} // 서버에서 받은 크기 사용
                                    height={height} // 서버에서 받은 크기 사용
                                    style={finalStyle} // 서버에서 받은 기존 스타일 유지
                                    quality={100}
                                    sizes={`(max-width: 334px) 100vw, ${width}px`}
                                    loading='lazy'
                                />
                            </Zoom>
                        );
                    }
                },
            });
        };

        setParsedContent(parseContent(post.content));
    }, []);

    const formattedDate: string = new Date(post.createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // 24-hour format
    });

    const deletePost = useDeletePost(postId, blogId);

    //  액세스 토큰이 유효하다면 작성자 인지 확인하는 로직
    // 일부 React Hook 특히 useEffect는 React Strict mode에서 두 번 실행 함. 끄고 싶다면 next.config.mjs에서 스트릭트 모드 off 해야함.
    useEffect(() => {
        if (isInitialized) {
            const accessToken: string | null = localStorage.getItem("access_token");

            if (!accessToken) return; // 비로그인 사용자 처리

            const fetchAuthorStatus: () => Promise<void> = async (): Promise<void> => {
                try {
                    const isAuthor = await fetchIsAuthor(postId, blogId, accessToken);

                    if (isAuthor) setIsAuthor(isAuthor);
                } catch (error) {
                    console.error("작성자 확인 실패 오류: ", error);
                }
            };

            fetchAuthorStatus();
        }
    }, [isInitialized]);

    // 아래 상세페이지에서 파일 다운할 수 있게 하는 코드.

    useEffect(() => {
        const anchorEl = document.querySelectorAll(".file-container__item") as NodeListOf<HTMLAnchorElement>;
        anchorEl.forEach((el: HTMLAnchorElement) => {
            el.addEventListener("click", (e) => {
                e.preventDefault();

                const fileUrl: string | null = el.getAttribute("href");

                console.log("el", el);
                console.log("el", fileUrl);

                if (fileUrl) {
                    const lastHyphenIndex = fileUrl.lastIndexOf("-");
                    const originalFileNameFromFileUrl = lastHyphenIndex !== -1 ? fileUrl.substring(lastHyphenIndex + 1) : fileUrl;

                    fetch(fileUrl)
                        .then((response) => response.blob())
                        .then((blob) => {
                            const blobUrl = window.URL.createObjectURL(blob); // Object URL 생성

                            console.log("blolbUrl >>>", blobUrl);

                            const link = document.createElement("a");
                            link.href = blobUrl;
                            // 한글 깨지는 현상 해결. URL 인코딩된 파일명을 올바른 한글 텍스트로 변환한다.
                            link.download = decodeURIComponent(originalFileNameFromFileUrl);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            window.URL.revokeObjectURL(blobUrl); // Object URL 해제
                        })
                        .catch(console.error);
                }
            });
        });
    }, []);

    const handleEdit: () => Promise<void> = async (): Promise<void> => {
        const isValidToken: boolean | undefined | null = await checkAccessToken();

        if (isValidToken) {
            // 토큰이 유효할 때 수정페이지로 접근
            // router.push를 쓰면 클라이언트 측에서 페이지 이동이 일어나기 때문에, 수정 페이지로 접근 시 페이지 전체가 새로고침 되지 않아 에디터 기능이 제대로 작동하지 않는다.
            // 따라서 수정 페이지로 이동할땐 window.location.href를 사용하여 수정 페이지 전체 새로고침이 일어나도록 한다.
            // router.push(`/posts/${postId}/edit`);
            router.push(`/${blogId}/posts/${postId}/edit`);
        }

        if (isValidToken === false) {
            try {
                const newAccessToken = await refreshToken();
                if (newAccessToken) {
                    // 토큰이 유효할 때 수정페이지로 접근
                    router.push(`/posts/${postId}/edit`);
                    // window.location.assign(`/${blogId}/posts/${postId}/edit`);
                }
            } catch (error: unknown) {
                if (error instanceof CustomHttpError) {
                    localStorage.removeItem("access_token");

                    toast.error(
                        <span style={{ whiteSpace: "pre-line" }}>
                            <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                        </span>,
                        {
                            onClose: () => {
                                window.location.reload();
                            },
                        }
                    );
                }
            }
        }
    };

    const handleDelete: () => void = (): void => {
        const onSuccess = async (data: { message: string } | undefined, variables: void, context: unknown) => {
            sessionStorage.setItem("isDeleting", "true");

            sessionStorage.removeItem("cached-users-posts");

            toast.success(
                <span>
                    <span style={{ fontSize: "0.7rem" }}>{data?.message}</span>
                </span>
            );

            await revalidatePostsAndSearch(blogId);
            await revalidateInfiniteScroll();
            await revalidatePagination();
            await revalidateCategories(blogId);
            await revalidatePostsCategories();
            await revalidatePostsCategoriesPagination();
            await revalidatePostDetailPage(blogId, postId);
            await revalidatePostEditPage(blogId, postId);

            setTimeout(() => {
                // window.location.replace(`/${blogId}/posts`);
                router.replace(`/${blogId}/posts`);
            }, 2500);
        };

        const onError = (error: unknown) => {
            if (error instanceof CustomHttpError) {
                if (error.status === 401) {
                    localStorage.removeItem("access_token");
                    toast.error(
                        <span>
                            <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                        </span>,
                        {
                            onClose: () => {
                                window.location.reload();
                            },
                        }
                    );
                } else if (error.status === 500) {
                    toast.error(
                        <span>
                            <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                        </span>
                    );
                }
            }
        };

        deletePost.mutate(undefined, { onSuccess, onError });
    };

    // 비공개로 변경도 클릭 시 토큰 검증 위와 같이 필요
    const handlePostStatus: () => void = (): void => {
        alert(`Change privacy setting from ${post.postStatus}`);
    };

    // 아래 ToastProvider 최상위 layout에 있는데, 삭제시에 toast가 작동을 안해서 아래와 같이 추가하니까 작동
    return (
        <>
            <ToastProvider />

            <div className='container mx-auto mt-[120px] max-w-4xl'>
                {/* Category and Date */}

                <span className='text-sm text-gray-500 mb-2'>카테고리: {post.categoryName || "없음"}</span>

                {/* Title */}
                <h2 className='text-3xl font-bold mt-3 mb-3'>{post.title}</h2>

                {/* space-x-4 자식 요소의 x축 간격을 1rem만큼 설정한다. space-x-4에서 4 = 1rem  */}
                <div className='flex space-x-4 mb-2'>
                    <span className='text-sm text-gray-500'>{formattedDate}</span>
                    <span className='text-sm text-gray-500'>{post.username}</span>
                </div>
                {/* Action Buttons */}
                {isAuthor && (
                    <div className='flex space-x-4 mb-4'>
                        <button onClick={handleEdit} className='text-sm text-gray-500'>
                            수정
                        </button>
                        <button onClick={handlePostStatus} className='text-sm text-gray-500'>
                            {post.postStatus === "PUBLIC" ? "비공개로 변경" : "공개로 변경"}
                        </button>
                        <button type='button' className='text-sm text-gray-500' onClick={() => setIsDeleteModalOpen(true)}>
                            삭제
                        </button>
                    </div>
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => {
                        handleDelete();
                        setIsDeleteModalOpen(false);
                    }}
                />

                {/* Content */}
                <div className='quill'>
                    <div className='ql-container ql-snow'>
                        <div className='ql-editor ql-blank'>
                            <div
                                className='text-gray-700'
                                // dangerouslySetInnerHTML={{ __html: processedContent }}
                            >
                                {parsedContent}
                            </div>
                        </div>
                    </div>
                </div>
                {/* <ReactQuill /> */}
            </div>
            <div className='my-0 mx-auto max-w-4xl'>
                {post.tags?.map((tag: string) => {
                    return (
                        <a key={tag} className='py-1 px-3 text-tagColor hover:text-customGray' href='#' data-ref='tag'>
                            {tag}
                        </a>
                    );
                })}
            </div>
        </>
    );
}

export default BlogDetail;
