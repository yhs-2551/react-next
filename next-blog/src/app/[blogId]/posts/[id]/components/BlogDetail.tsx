"use client";

import "./BlogDetail.css";

import "react-quill-new/dist/quill.snow.css"; // Snow 테마 CSS 파일

import parse, { DOMNode, Element } from "html-react-parser";

import useDeletePost from "@/customHooks/useDeletePost";

import React, { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { toast, ToastContainer } from "react-toastify";
import { checkAccessToken, fetchIsAuthor } from "@/services/api";

import NextImage from "next/image";
import { FileMetadata, PostResponse } from "@/types/PostTypes";
import { refreshToken } from "@/utils/refreshToken";
import DOMPurify from "dompurify";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { useAuthStore } from "@/store/appStore";

function BlogDetail({ initialData, postId }: { initialData: PostResponse; postId: string }) {
    const [isAuthor, setIsAuthor]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = useState<boolean>(false); // 작성자 여부 상태
    const [parsedContent, setParsedContent] = useState<React.ReactNode | null>(null);

    const params = useParams();
    const blogId = params.blogId as string;

    const post = initialData;

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
                            <NextImage
                                key={src}
                                src={src}
                                alt={alt || "detail page image"}
                                width={width} // 서버에서 받은 크기 사용
                                height={height} // 서버에서 받은 크기 사용
                                style={finalStyle} // 서버에서 받은 기존 스타일 유지
                                loading='lazy'
                            />
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
                } catch (error: unknown) { // ux측면에서 작성자 확인이 실패하였습니다. 잠시 후 다시 시도해주세요. 할필요가 있을까 일단 보류
                    if (error instanceof CustomHttpError) {
                        if (error.status === 500) {
                            toast.error(
                                <span>
                                    <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                                </span>
                            );
                        }
                    }
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
            window.location.assign(`/${blogId}/posts/${postId}/edit`);
        }

        if (isValidToken === false) {
            try {
                const newAccessToken = await refreshToken();
                if (newAccessToken) {
                    // 토큰이 유효할 때 수정페이지로 접근
                    // router.push(`/posts/${postId}/edit`);
                    window.location.assign(`/${blogId}/posts/${postId}/edit`);
                }
            } catch (error: unknown) {
                if (error instanceof CustomHttpError) {
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
                }
            }
        }
    };

    const handleDelete: () => void = (): void => {
        deletePost.mutate(undefined, {
            onSuccess: async (data: { message: string } | undefined, variables: void, context: unknown) => {
                localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE"); // 글 삭제 성공 후 캐시 삭제. 카테고리 페이지로 갔을 떄 새로운 데이터로 불러오기 위함

                // 이전에 사용한 router관련 push, router.replace, refresh, reload에 대한 주석 설명은 이전 커밋 기록들에서 확인.
                // 수정 및 삭제시에도 window방식을 사용하기 때문에 일관성 및 앱의 안전성을 위하여 window방식 사용
                toast.success(
                    <span>
                        <span style={{ fontSize: "0.7rem" }}>{data?.message}</span>
                    </span>,
                    {
                        onClose: () => {
                            window.location.replace(`/${blogId}/posts`);
                        },
                        autoClose: 2000, // 2초 후 자동으로 닫힘
                    }
                );
            },
            onError: (error: unknown) => {
                if (error instanceof CustomHttpError) {
                    if (error.status === 401) {
                        // 리프레시 토큰 까지 만료된 경우 재로그인 필요

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
            },
        });
    };

    // 비공개로 변경도 클릭 시 토큰 검증 위와 같이 필요
    const handlePostStatus: () => void = (): void => {
        alert(`Change privacy setting from ${post.postStatus}`);
    };

    return (
        <>
            <ToastContainer position='top-center' />
            <div className='container mx-auto p-6 max-w-4xl'>
                {/* Category and Date */}

                <span className='text-sm text-gray-500 mb-2'>카테고리: {post.categoryName || "없음"}</span>

                {/* Title */}
                <h2 className='text-3xl font-bold mt-3 mb-3'>{post.title}</h2>

                {/* space-x-4 자식 요소의 x축 간격을 1rem만큼 설정한다. space-x-4에서 4 = 1rem  */}
                <div className='flex space-x-4 mb-2'>
                    <span className='text-sm text-gray-500'>{formattedDate}</span>
                    <span className='text-sm text-gray-500'>{post.userName}</span>
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
                        <button onClick={handleDelete} className='text-sm text-gray-500'>
                            삭제
                        </button>
                    </div>
                )}

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
