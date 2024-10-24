"use client";

import "./BlogDetail.css";

import "react-quill/dist/quill.snow.css"; // Snow 테마 CSS 파일

import type { FileMetadata, PostResponse } from "@/common/types/PostTypes";

import parse, { DOMNode, Element } from "html-react-parser";

import useDeletePost from "@/customHooks/useDeletePost";
// import { useGetPost } from "@/customHooks/useGetPost";
import ClientWrapper from "@/providers/ClientWrapper";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast, ToastContainer } from "react-toastify";
import { checkAccessToken, fetchIsAuthor } from "@/services/api";
import DOMPurify from "dompurify";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { refreshToken } from "../../(common)/utils/refreshToken";
import NextImage from "next/image";

function BlogDetail({ initialData, postId }: { initialData: PostResponse; postId: string }) {
    const router: AppRouterInstance = useRouter();
    const accessToken: string | false = localStorage.getItem("access_token") ?? false;
    const [newAccessToken, setNewAccessToken]: [string | null, React.Dispatch<React.SetStateAction<string | null>>] = useState<string | null>(null);
    const [isAuthor, setIsAuthor]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = useState<boolean>(false); // 작성자 여부 상태


    // const [imgSize, setImgSize] = useState<{
    //     [key: string]: { width: number; height: number };
    // }>({});
    // const [imagesToLoad, setImagesToLoad] = useState<string[]>([]);

    const post = initialData;

    // 아래 주석된 코드들은 시스템에 저장 되어 있는 이미지의 원본 크기를 가져오기 위한 코드들. 커밋하면 삭제 예정
    // 이미지 원본 크기를 설정하는 함수
    // useEffect(() => {
    //     if (imagesToLoad.length > 0) {
    //         // set으로 중복 제거 후 배열로 다시 반환.
    //         const uniqueImagesToLoad = Array.from(new Set(imagesToLoad));

    //         uniqueImagesToLoad.forEach((src) => {
    //             if (imgSize[src]) return;

    //             if (!imgSize[src]) {
    //                 const img = new Image() as HTMLImageElement;
    //                 img.src = src;
    //                 img.onload = () => {
    //                     setImgSize((prev) => ({
    //                         ...prev,
    //                         [src]: { width: img.naturalWidth, height: img.naturalHeight },
    //                     }));
    //                 };
    //             }
    //         });
    //     }
    // }, [imagesToLoad]);

    // const parseContent = (htmlString: string) => {
    //     return parse(DOMPurify.sanitize(htmlString), {
    //         replace: (domNode: DOMNode) => {
    //             if (domNode instanceof Element && domNode.name === "img") {
    //                 const { src, alt } = domNode.attribs;

    //                 // 상태에 저장되어 있는 이미지 원본 크기를 가져오기. 초기에는 없을텐데 없다면 setImagesToLoad 상태를 통해 원본 이미지 크기 설정.
    //                 const { width, height } = imgSize[src] || { width: "500", height: "500" }; // 초기값 지정 즉, 상태관리를 통해 원본 이미지 크기를 가져오기 전까지 사용

    //                 console.log("width >>>" + width);
    //                 console.log("height >>>" + height);

    //                 // 이미지 로딩 후 크기를 설정
    //                 if (!imgSize[src] && !imagesToLoad.includes(src)) {
    //                     setImagesToLoad((prev) => [...prev, src]);
    //                 }

    //                 return (
    //                     <NextImage
    //                         key={src}
    //                         src={src}
    //                         alt={alt || "detail page image"}
    //                         width={width} // 기본값 추가
    //                         height={height} // 기본값 추가
    //                         style={{ width: "auto", height: "auto" }}
    //                         loading='lazy'
    //                     />
    //                 );
    //             }
    //         },
    //     });
    // };


    const parseStyleString = (style: string) => {
        return style.split(';').reduce((acc: { [key: string]: string | number }, styleProperty) => {
            const [key, value] = styleProperty.split(':');
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
    
    
    const parseContent = (htmlString: string) => {
        // 이미지 태그가 포함되어 있는지 확인. 이미지 태그가 없다면 굳이 아래 서버로부터 이미지 크기 가져와서 Next 이미지 변환 로직을 실행할 필요가 없음.
        // DOM에서 이미지는 <img src~~와 같이 시작하기 때문에 <img로 선택
        if (!htmlString.includes("<img")) {
            return parse(DOMPurify.sanitize(htmlString));
        }
    
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
                            loading="lazy"
                        />
                    );
                }
            },
        });
    };

    // 일부 React Hook 특히 useEffect는 React Strict mode에서 두 번 실행 함. 끄고 싶다면 next.config.mjs에서 스트릭트 모드 off 해야함.
    // 새로고침 시 액세스 토큰 유효성 검사 확인하는 로직
    useEffect(() => {
        const validateTokenOnLoad: () => Promise<void> = async (): Promise<void> => {
            const isValidToken = await checkAccessToken();

            if (isValidToken) return;

            if (!isValidToken) {
                const newAccessToken = await refreshToken();
                if (newAccessToken) {
                    setNewAccessToken(newAccessToken);
                    return;
                }

                if (!newAccessToken) {
                    throw new Error("Failed to enter the detail post page. please retry again.");
                }
            }
        };

        if (accessToken) {
            validateTokenOnLoad();
        }
    }, []);

    // 아래 fetchIsAuthor 도 액세스 토큰이 있을 경우에만 실행. 액세스 토큰이 유효하다면 작성자 인지 확인하는 로직
    useEffect(() => {
        const fetchAuthorStatus: () => Promise<void> = async (): Promise<void> => {
            const isAuthor = await fetchIsAuthor(postId);

            if (isAuthor) setIsAuthor(isAuthor);
        };

        if (accessToken) {
            fetchAuthorStatus();
        }
    }, [newAccessToken]);

    // 아래 상세페이지에서 파일 다운할 수 있게 하는 코드. 일단 주석처리

    // dangerouslySetInnerHTML을 사용하여 HTML을 렌더링할 때, 다운로드 링크를 생성하는 로직
    // dangerouslySetInnerHTML은 HTML을 렌더링할 때 React가 관리하지 않기 때문에, React가 관여하지 않는 DOM 변화를 갖미하여 추가적인 작업(예: 다운로드 링크 생성)을 할 수 있다.
    // useEffect(() => {
    //     const setDownloadAttributes: () => void = (): void => {
    //         const anchorTags: NodeListOf<HTMLAnchorElement> = document.querySelectorAll("a");
    //         let downloadAttributeSet: boolean = false;

    //         anchorTags?.forEach((anchorTag: HTMLAnchorElement) => {
    //             const fileUrl: string | null = anchorTag.getAttribute("href");

    //             if (fileUrl) {
    //                 const lastHyphenIndex = fileUrl.lastIndexOf("-");
    //                 const originalFileNameFromFileUrl = lastHyphenIndex !== -1 ? fileUrl.substring(lastHyphenIndex + 1) : fileUrl;

    //                 if (originalFileNameFromFileUrl && anchorTag.textContent?.includes("첨부된 파일:")) {
    //                     // Blob을 사용하여 다운로드 링크 생성
    //                     fetch(fileUrl)
    //                         .then((response) => response.blob())
    //                         .then((blob) => {
    //                             const url = window.URL.createObjectURL(blob); // Object URL 생성
    //                             anchorTag.setAttribute("href", url);
    //                             anchorTag.setAttribute("download", decodeURIComponent(originalFileNameFromFileUrl));
    //                             anchorTag.style.color = "#06c";
    //                             downloadAttributeSet = true;
    //                             // window.URL.revokeObjectURL(url); // Object URL 해제 여기서 하면 다운이 안됨 인터넷 오류 발생
    //                         })
    //                         .catch(console.error);
    //                 }
    //             } else {
    //                 console.log("Cannot find originalFileNameFromFileUrl and anchorTag.textContent >>>");
    //             }
    //         });

    //         // 다운로드 속성이 설정되면 observer를 해제
    //         if (downloadAttributeSet) {
    //             observer.disconnect();
    //         }
    //     };

    //     const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[], obs: MutationObserver): void => {
    //         setDownloadAttributes();
    //     });

    //     const targetNode: HTMLDivElement = document.querySelector(".container") as HTMLDivElement;
    //     if (targetNode) {
    //         observer.observe(targetNode, { childList: true, subtree: true });
    //     }

    //     return () => {
    //         observer.disconnect();
    //     };
    // }, []);

    const deletePost = useDeletePost();

    const formattedDate: string = new Date(post.createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // 24-hour format
    });

    const handleEdit: () => Promise<void> = async (): Promise<void> => {
        if (!accessToken) {
            router.push("/login"); // 로그인 안된 사용자 처리
            return;
        }
        const isValidToken: boolean | undefined = await checkAccessToken();

        if (isValidToken) {
            // 토큰이 유효할 때 수정페이지로 접근
            // router.push를 쓰면 클라이언트 측에서 페이지 이동이 일어나기 때문에, 수정 페이지로 접근 시 페이지 전체가 새로고침 되지 않아 에디터 기능이 제대로 작동하지 않는다.
            // 따라서 수정 페이지로 이동할땐 window.location.href를 사용하여 수정 페이지 전체 새로고침이 일어나도록 한다.
            // router.push(`/posts/${postId}/edit`);
            window.location.href = `/posts/${postId}/edit`;
        }

        if (!isValidToken) {
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                // 토큰이 유효할 때 수정페이지로 접근
                // router.push(`/posts/${postId}/edit`);
                window.location.href = `/posts/${postId}/edit`;
            }
            if (!newAccessToken) {
                throw new Error("Failed to enter the edit post page. please retry again.");
            }
        }
    };

    const handleDelete: () => void = (): void => {
        deletePost.mutate(postId, {
            onSuccess: async () => {
                router.replace("/posts");
                // 삭제 후 글 목록 페이지로 갔을때 router.push는 페이지 새로고침이 아닌 클라이언트 측 이동이기때문에 서버 컴포넌트가 재실행 되지 않는다.
                // 따라서 router.push로 이동 후에 router.refresh()로 서버 컴포넌트를 다시 실행해서 새로운 데이터를 가져온 후 삭제 작업이 적용될 수 있도록 한다.
                // router.refresh()는 서버 컴포넌트를 다시 실행한다. 즉 서버 컴포넌트만 다시 가져와서 렌더링을 갱신하는 방식.
                // 클라이언트 컴포넌트의 상태를 초기화하지 않는다. 클라이언트 컴포넌트의 상태를 초기화하려면 router.reload()를 사용해야 한다.
                router.refresh();

                console.log("Post deleted successfully");

                // 포스트 목록을 다시 불러오게 만듦
                // queryClient.invalidateQueries(["posts"]);

                // 리액트 쿼리의 프리패치
                // await queryClient.prefetchQuery(["posts"], fetchPosts);
            },
            onError: (error: any) => {
                console.error("Error deleting post:", error.message);
            },
        });
    };

    // 비공개로 변경도 클릭 시 토큰 검증 위와 같이 필요
    const handlePostStatus: () => void = (): void => {
        alert(`Change privacy setting from ${post.postStatus}`);
    };

    return (
        <>
            <ToastContainer />
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
                                {parseContent(post.content)}
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

// function BlogDetailWithProvider({ initialData, postId }: { initialData: PostResponse; postId: string }) {
//     return (
//         <ClientWrapper>
//             <BlogDetail initialData={initialData} postId={postId} />
//         </ClientWrapper>
//     );
// }

// export default BlogDetailWithProvider;
