"use client";

import React, { ChangeEvent, useEffect, useRef } from "react";

import { v4 as uuidv4 } from "uuid";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAddPost from "@/customHooks/useAddPost";
import { useParams, useRouter } from "next/navigation";
import { extractTextFromHtml } from "@/utils/extractTextFromHtml";
import useUpdatePost from "@/customHooks/useUpdatePost";
import { UseMutationResult, useQueryClient } from "react-query";

import "highlight.js/styles/atom-one-dark-reasonable.css";

import dynamic from "next/dynamic";
import { FileMetadata, PostRequest, PostResponse } from "@/types/PostTypes";
import { Tag } from "@/types/TagTypes";
import { CategoryType } from "@/types/CateogryTypes";
import { useGetAllCategories } from "@/customHooks/useGetCategories";
import { CustomHttpError } from "@/utils/CustomHttpError";
import PublishModal from "../modal/PublishModal";
import { revalidateCategories, revalidateCategoriesPagination, revalidatePagination, revalidatePostsAndSearch } from "@/actions/revalidate";

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
        return import("../quillEditor/QuillEditor");
    },
    {
        ssr: false,
        // loading: () => <ClipLoader color='#000' loading={true} size={50} /> 나중에 구현 예정
    }
);

// const CustomEditor = dynamic( () => import( '@/app/posts/new/components/CKEditor/CustomCKEditor' ), { ssr: false } );

function BlogForm({ initialData, postId }: { initialData?: PostResponse; postId?: string }) {
    const isEditingRef = useRef<boolean>(!!postId);

    const quillContentRef = useRef<() => string>(() => "");

    const modalRef = useRef<HTMLDivElement | null>(null);

    const contentRef = useRef<string | undefined>(initialData?.content);

    const titleInputRef = useRef<HTMLInputElement | null>(null);

    // 최종 발행 시 서버로 전송할 파일 Ref
    const fileRef = useRef<FileMetadata[]>([]);
    // 사용자가 뒤로가기 및 새로고침 등의 페이지를 나갈 때 클라우드 스토리지에 임시로 저장된 전체 파일을 삭제하기 위한 Ref
    const totalUploadedImagesUrlRef: React.MutableRefObject<string[]> = useRef<string[]>([]);

    const deletedImageUrlsInFutureRef: React.MutableRefObject<string[]> = useRef<string[]>([]);

    const categoryRef = useRef<HTMLSelectElement>(null);

    // const categoriesRef = useRef<CategoryType[]>([]);
    const categories = useRef<CategoryType[]>([]);

    const tags = useRef<Tag[]>([]);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const tagContainerRef = useRef<HTMLDivElement>(null);
    //수정 작업 시 서버로 삭제 된 태그를 전송해주기 위함.
    const editPageDeletedTags = useRef<string[]>([]);

    const errorMessageRef = useRef<string | null>(null);

    const queryClient = useQueryClient();

    const router = useRouter();

    const params = useParams();
    const blogId = params.blogId as string;

    const addPostMutation = useAddPost(blogId);

    let updatePostMutation: UseMutationResult<any, unknown, PostRequest, unknown>;

    if (postId) {
        updatePostMutation = useUpdatePost(postId, blogId);
    }

    // 리액트 쿼리 오프라인 캐시를 가져와서 카테고리 데이터를 캐싱
    // useMemo(() => {
    //     const cacheData = localStorage.getItem("REACT_QUERY_OFFLINE_CACHE");
    //     if (!cacheData)  return [];
    //     try {
    //         const parsedData = JSON.parse(cacheData);
    //         const data = parsedData?.clientState?.queries?.[0]?.state?.data?.data || [];
    //         // ref의 current에 직접 할당
    //         categoriesRef.current = data;
    //         return data;
    //     } catch (error) {
    //         console.error("캐시 파싱 에러:", error);
    //         return [];
    //     }
    // }, []);

    const { data: categoriesData, refetchCategories, isFetching, isRefetching, isLoading, error } = useGetAllCategories();

    useEffect(() => {
        console.log("categoriesData >>>>", categoriesData);

        if (categoryRef.current && categoriesData) {
            // 기존 옵션 제거
            categoryRef.current.innerHTML = "";

            // 기본 옵션 추가
            const defaultOption = document.createElement("option");
            defaultOption.value = "null";
            defaultOption.textContent = "카테고리";
            categoryRef.current.appendChild(defaultOption);

            // 카테고리 데이터 렌더링
            categoriesData.data.forEach((mainCategory: CategoryType) => {
                // 상위 카테고리 옵션 생성
                const mainOption = document.createElement("option");
                mainOption.value = mainCategory.name;
                mainOption.textContent = mainCategory.name;
                mainOption.className = "text-sm";
                categoryRef.current?.appendChild(mainOption);

                // 하위 카테고리 옵션 생성
                if (mainCategory.children && mainCategory.children.length > 0) {
                    mainCategory.children.forEach((subCategory) => {
                        const subOption = document.createElement("option");
                        subOption.value = subCategory.name;
                        subOption.textContent = `└ ${subCategory.name}`;
                        subOption.className = "text-xs";
                        categoryRef.current?.appendChild(subOption);
                    });
                }
            });

            // 수정 페이지에서 초기 카테고리 데이터 지정은 아래쪽 useEffect에서 하는게 아닌, 카테고리 관련된 useEffect에서 같이 처리.
            if (categoryRef.current && initialData?.categoryName) {
                categoryRef.current.value = initialData.categoryName;
            }
        }
    }, [categoriesData]); // initialData를 추가적으로 의존성으로 주지 않는 이유는 initialData는 서버사이드렌더링으로 초기에 오고, categoriesData는 클라이언트측 요청으로 그 이후에 오기 때문에 categoriesData만 의존성으로 주어도 된다.
    useEffect(() => {
        if (titleInputRef.current && initialData?.title) {
            titleInputRef.current.value = initialData.title;
        }

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

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (categoryRef.current) {
            categoryRef.current.value = e.target.value;
        }
    };

    const handleComplete = () => {
        console.log("컨텐츠 >>>>" + categoryRef.current?.value);

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

        let categoryName = categoryRef.current!.value as string | null;

        console.log("타이틀 >>>>" + title);
        console.log("컨텐츠 >>>>" + content);

        console.log("postStatus >>>>" + postStatus);
        console.log("댓글 허용 여부 >>" + commentsEnabled);

        const postData = {
            title,
            content,
            categoryName,
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

            // 검색어 추천 캐시 무효화. 실제 데이터 재요청은 백그라운드에서 발생하기 떄문에 빠른 응답을 위해 await 불필요
            // 이 부분 무효화가 안돼서 일단 보류. 새로고침으로 적용. 글쓰기 및 글수정 페이지 접근 시 새로고침 되니까
            // invalidateSearchSuggestions(queryClient);

            // 글목록 서버 컴포넌트 캐시 무효화. 변경사항을 적용하기 위해 await 필수
            // 캐시 무효화 후 아래에서 router.replace로 페이지 이동하면 서버 컴포넌트 재실행
            // revalidatePath는 await없어도 되지만 안정성을 위해 추가
            await revalidatePostsAndSearch(blogId);
            // 태그 무효화의 경우 await 필수, await 없으면 태그 무효화 적용 안됨
            await revalidatePagination();
            await revalidateCategories();
            await revalidateCategoriesPagination();
            // window.location.replace사용하기 전인 router push, router refresh관련 주석은 이전 커밋 기록에서 확인
            const replacePath = isEditingRef.current ? `/${blogId}/posts/${postId}` : `/${blogId}/posts`;
            // window.location.replace(replacePath);
            router.replace(replacePath);

            localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE"); // 글 작성 성공 후 캐시 삭제. 카테고리 페이지로 갔을 떄 새로운 데이터로 불러오기 위함
        };

        const onError = (error: unknown) => {
            if (error instanceof CustomHttpError) {
                if (error.status === 401) {
                    toast.error(
                        <span style={{ whiteSpace: "pre-line" }}>
                            <span style={{ fontSize: "0.7rem" }}>{error.message}</span>
                        </span>
                    );
                } else {
                    errorMessageRef.current = error.message; // useAddPost 또는 useUpdatePost에서 throw new Error로 던진 에러 메시지가 error.message에서 사용 된다.
                }
            }
        };

        // 글 수정 같은 경우에는 글 작성자 ID와 토큰 Id값을 비교해서 백엔드에서 검증 처리를 할 수 있지만, 글 생성 같은 경우에는 글 작성자 ID가 없기 때문에 경로 파라미터인 blogId를 사용하여 백엔드에서 검증 처리를 한다.
        if (isEditingRef.current) {
            updatePostMutation.mutate(postData, { onSuccess, onError });
        } else {
            addPostMutation.mutate(postData, { onSuccess, onError });
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

            <form onSubmit={(e) => e.preventDefault()} className='pb-32'>
                <fieldset className=''>
                    <legend className='sr-only'>새로운 블로그 글 등록 폼</legend>

                    <div className='mb-4'>
                        <select
                            ref={categoryRef}
                            className='w-[20%] p-2 border border-gray-300 rounded-md text-sm'
                            onChange={handleCategoryChange}
                        ></select>
                    </div>

                    <div className='mb-4 '>
                        <h2>
                            <input
                                ref={titleInputRef}
                                className='w-full pb-4 pt-2 focus:outline-none border-b text-2xl font-medium'
                                type='text'
                                placeholder='제목을 입력하세요'
                                onChange={handleTitleChange}
                                aria-label='게시글 제목'
                            />
                        </h2>
                    </div>

                    {/* quilleditor 내부의 figure(오버레이) absolute된 부모이기 때문에 해당 figure의 z-index는 이 부모 내에서만 적용
                        아래쪽 (나가기, 완료) 하단 고정부의 z-index와 올바르게 작동하기 위해서 에디터 컨테이너 자체의 z-index 설정 필요.

                        또한 header가 998인데, QuillEditor의 DropdownMenu가 헤더 위쪽 부분에 보여야 하기 때문에 아래 z-999로 설정
                    */}
                    <div className='ql-custom-container relative min-h-[500px] z-[999]'>
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

                    <div className=''>
                        <input
                            ref={tagInputRef}
                            className='w-full text-xs focus:outline-none'
                            type='text'
                            placeholder='#태그 입력 (,키 및 엔터키로 분리)'
                            onKeyDown={handleTagKeyDown}
                        />
                        <div ref={tagContainerRef} className='mt-2'></div>
                    </div>
                </fieldset>

                <div className='fixed bottom-0 left-0 right-0 bg-gray-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-6 py-4 z-[1000]'>
                    <div className='max-w-screen-xl mx-auto flex justify-between items-center'>
                        <button
                            type='button'
                            className='px-6 py-2.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none active:bg-gray-800 transition-colors opacity-80'
                            onClick={() => router.back()}
                        >
                            나가기
                        </button>
                        <button
                            type='submit'
                            className='px-6 py-2.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none active:bg-gray-800 transition-colors'
                            onClick={handleComplete}
                        >
                            완료
                        </button>
                    </div>
                </div>

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
