"use client";

import "./BlogDetail.css";

import "react-quill-new/dist/quill.snow.css"; // Snow 테마 CSS 파일

import parse, { DOMNode, Element } from "html-react-parser";

import useDeletePost from "@/customHooks/useDeletePost";

import React, { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { toast, ToastContainer } from "react-toastify";
import { fetchIsAuthor, postStatusChange } from "@/services/api";

import { FileMetadata, PostResponse } from "@/types/PostTypes";
import DOMPurify from "dompurify";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { useAuthStore } from "@/store/appStore";
import ToastProvider from "@/providers/ToastProvider";

import { revalidatePostsAndCategories } from "@/actions/revalidate";

import DeleteModal from "@/app/_components/modal/DeleteModal";
import { LightboxImage } from "./LightboxImage";

function BlogDetail({ initialData, postId }: { initialData: PostResponse; postId: string }) {
    const [isAuthor, setIsAuthor]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = useState<boolean>(false); // 작성자 여부 상태

    const [postStatus, setPostStatus] = useState<"PUBLIC" | "PRIVATE">(initialData.postStatus);

    const [parsedContent, setParsedContent] = useState<React.ReactNode | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const params = useParams();
    const blogId = params.blogId as string;

    const post = initialData;

    const router = useRouter();

    const { isInitialized, isAuthenticated, isUserLoggedOut, setUserLoggedOut } = useAuthStore();

    const imageUrls = post.files?.map((file) => file.fileUrl) || [];

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

                        // 서버에서 받은 이미지 크기 정보를 가져오기
                        const { width, height } = getImageSize(src);

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

                        return (
                            <LightboxImage
                                unique={src}
                                src={src}
                                alt={alt || "detail page image"}
                                width={width} // 서버에서 받은 크기 사용
                                height={height} // 서버에서 받은 크기 사용
                                style={finalStyle} // 서버에서 받은 기존 스타일 유지
                                allImages={imageUrls}
                            />
                            // <NextImage
                            //     key={src}
                            //     src={src}
                            //     alt={alt || "detail page image"}
                            //     width={width} // 서버에서 받은 크기 사용
                            //     height={height} // 서버에서 받은 크기 사용
                            //     style={finalStyle} // 서버에서 받은 기존 스타일 유지
                            //     quality={100}
                            //     sizes={`(max-width: 334px) 100vw, ${width}px`}
                            //     loading='lazy'
                            // />
                        );
                    }
                },
            });
        };

        setParsedContent(parseContent(post.content));
    }, []);

    const formattedDate: string = new Date(post.createdAt!).toLocaleString("ko-KR", {
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
        const accessToken: string | null = localStorage.getItem("access_token");

        // 비로그인 사용자 또는 기존 사용자가 로그아웃하고 상세 페이지에 다시 왔을 때 불필요하게 컴포넌트가 재실행되지 않기 위해서 아래처럼 처리
        if (isUserLoggedOut && !accessToken) {
            // 로그인된 사용자가 로그아웃 했을 때 처리
            setIsAuthor(false);
            setUserLoggedOut(false);
            return;
        }
        if (!accessToken) {
            return; // 비로그인 사용자 및 로그인된 사용자가 로그아웃하고 다시 상세페이지에 들어왔을때 처리
        }

        const fetchAuthorStatus: () => Promise<void> = async (): Promise<void> => {
            try {
                const isAuthor = await fetchIsAuthor(blogId, accessToken);

                if (isAuthor) setIsAuthor(isAuthor);
            } catch (error) {
                console.error("작성자 확인 실패 오류: ", error);
            }
        };

        fetchAuthorStatus();
    }, [isInitialized, isAuthenticated]);

    useEffect(() => {
        let observer: MutationObserver;

        const setupFileDownload = () => {
            const anchorEl = document.querySelectorAll(".ql-file") as NodeListOf<HTMLAnchorElement>;

            let allElementsHaveListeners = true;

            anchorEl.forEach((el: HTMLAnchorElement) => {
                if (!el.dataset.hasListener) {
                    allElementsHaveListeners = false;
                    el.dataset.hasListener = "true";
                    el.addEventListener("click", (e) => {
                        e.preventDefault();

                        const fileUrl: string | null = el.getAttribute("href");

                        if (fileUrl) {
                            const lastHyphenIndex = fileUrl.lastIndexOf("-");
                            const originalFileNameFromFileUrl = lastHyphenIndex !== -1 ? fileUrl.substring(lastHyphenIndex + 1) : fileUrl;

                            fetch(fileUrl)
                                .then((response) => response.blob())
                                .then((blob) => {
                                    const blobUrl = window.URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = blobUrl;
                                    link.download = decodeURIComponent(originalFileNameFromFileUrl);
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(blobUrl);
                                })
                                .catch(console.error);
                        }
                    });
                }
            });

            // 모든 요소에 리스너가 설정되어 있고, 요소가 하나 이상 존재하면 옵저버 중단
            if (allElementsHaveListeners && anchorEl.length > 0) {
                observer?.disconnect();
            }
        };

        // 초기 설정
        setupFileDownload();

        // MutationObserver 설정
        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    setupFileDownload();
                }
            });
        });

        // 관찰 시작
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // 클린업
        return () => {
            observer.disconnect();
        };
    }, []);

    // 권한 확인은 AuthCheck에서 진행. 즉 수정 페이지로 이동하면 AuthCheck가 실행
    // 문제는 수정 페이지의 서버 컴포넌트가 실행 되면서 권한 확인이 되지 않은 상태에서 데이터를 가져 온다는 점인데,
    // 즉 권한 확인 -> 완료 후에 해당 상세 페이지 데이터를 가져와야 하는데, 일단 보류
    const handleEdit: () => Promise<void> = async (): Promise<void> => {
        router.push(`/${blogId}/posts/${postId}/edit`);
    };

    // 아래 toast, setTimeout 캐시 무효화 순서 저렇게 해야만 올바르게 작동함. 시간만 조정 가능
    const handleDelete: () => void = (): void => {
        const onSuccess = async (data: { message: string } | undefined, variables: void, context: unknown) => {
            
            // isDeleting true 아래 코드 사용 안해도 일단 작동 잘하는데, 나중에 문제 없을 시 주석 삭제. 혹시 몰라서 남겨둠
            // 아래 코드는 notfound.tsx와 연관이 있음 
            // sessionStorage.setItem("isDeleting", "true");

            sessionStorage.removeItem("cached-users-posts");

            await revalidatePostsAndCategories(blogId);

            router.replace(`/${blogId}/posts`);


            // 토스트 사용 시 삭제 -> 토스트 메시지 나온 후 검정색 깜빡임 있는거 해결 안되어서 일단 토스트 안씀
            // toast.success(
            //     <span>
            //         <span style={{ fontSize: "0.8rem", whiteSpace: "pre-line" }}>{data?.message || "게시글이 성공적으로 삭제되었습니다."}</span>
            //     </span>,
            //     {
            //         autoClose: 500,
            //     }
            // );

            // setTimeout(async () => {
            //     await revalidatePostsAndCategories(blogId);
            //     // await revalidateAllRelatedCaches(blogId);
            //     // await revalidatePostDetailPage(blogId, postId);
            //     // await revalidatePostEditPage(blogId, postId);

            //     router.replace(`/${blogId}/posts`);
            // }, 1000);

         
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
    const handlePostStatus = async () => {
        const accessToken = localStorage.getItem("access_token") as string;

        const newStatus = postStatus === "PUBLIC" ? "PRIVATE" : "PUBLIC";

        try {
            await postStatusChange(blogId, accessToken, postId, newStatus);
            setPostStatus(newStatus);
            await revalidatePostsAndCategories(blogId); // 현재는 게시글만 무효화 하면 되지만, 나중에 사용자 게시글 목록에 있는 카테고리에 PUBLIC 상태 게시글 총 수를 표시하기 위해 확장을 고려하여 이와 같이 유지
        } catch (error: unknown) {
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
                }
            }
        }
    };

    // 아래 ToastProvider 최상위 layout에 있는데, 삭제시에 toast가 작동을 안해서 아래와 같이 추가하니까 작동
    // 현재는 토스트 사용시 삭제할 때 검정 깜빡임 문제 때문에 ToastProvider 주석 처리 
    return (
        <>
     
             {/* <ToastProvider /> */}

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
                {/* Action Buttons, 수정 버튼은 단순 이동이기 때문에 Link로 쓸수도 있지만 그 밑에 버튼과의 일관성을 위해 유지 */}
                {isAuthor && (
                    <div className='flex space-x-4 mb-4'>
                        <button onClick={handleEdit} className='text-sm text-gray-500'>
                            수정
                        </button>
                        <button onClick={handlePostStatus} className='text-sm text-gray-500'>
                            {postStatus && (postStatus === "PUBLIC" ? "비공개로 변경" : "공개로 변경")}
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
            <div className='my-0 mx-auto max-w-4xl pb-32'>
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
