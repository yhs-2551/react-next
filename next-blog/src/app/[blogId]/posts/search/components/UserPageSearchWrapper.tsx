"use client";

import { Suspense, useEffect, useState } from "react";
import BlogList from "../../components/BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { searchPostsForUserPage } from "@/actions/post.actions";
import { PostsReadBaseProps } from "@/types/PostTypes";
import { useSearchStore } from "@/store/appStore";
import { refreshToken } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { toast } from "react-toastify";
import GlobalLoading from "@/app/loading";

interface SearchWrapperProps {
    blogId: string;
    searchParams: {
        page?: string;
        searchType?: string;
        keyword?: string;
        category?: string;
    };
}

export default function UserPageSearchWrapper({ blogId, searchParams }: SearchWrapperProps) {
    const { page, searchType, keyword, category } = searchParams;

    const isValidSearch = searchType && keyword;

    const [searchResults, setSearchResults] = useState<PostsReadBaseProps>({
        content: [],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { searchTriggerNum } = useSearchStore();

    useEffect(() => {
        const fetchSearch = async () => {
            if (!isValidSearch) {
                return;
            }

            // URL로 page번호 없이 검색하면 page는 백엔드에서 사용하는 기본값으로 처리
            const queryParams = new URLSearchParams({
                // page && { page } => page 존재하면 { page: page } 객체 반환
                // 스프레드 연산자(...)로 객체를 URLSearchParams에 펼침
                ...(page && { page }),
                ...(category && { category }),
                searchType,
                keyword,
            }).toString(); // 클라이언트 컴포넌트에선 .toString() 필수, size는 따로 요청때 숫자값으로 넣어줘야 백엔드에서 받을 수 있음. (서버 컴포넌트 였으면 한번에 처리 가능)

            const token = localStorage.getItem("access_token");

            setIsLoading(true);

            try {
                const response = await searchPostsForUserPage(blogId, queryParams, token);
                const { content, currentPage, totalPages, totalElements } = response.data;
                setSearchResults({ content, currentPage, totalPages, totalElements });
            } catch (error: unknown) {
                if (error instanceof Error && error.message === "액세스 토큰 만료") {
                    try {
                        const newAccessToken = await refreshToken(); // 서버 액션에서 refreshToken을 호출하면 쿠키 전송이 안됨. refresh token을 use client쓰면 서버 액션 내에서 호출 불가
                        if (newAccessToken) {
                            const retryResponse = await searchPostsForUserPage(blogId, queryParams, newAccessToken);
                            const { content, currentPage, totalPages, totalElements } = retryResponse.data;
                            setSearchResults({ content, currentPage, totalPages, totalElements });
                        }
                    } catch (e: unknown) {
                        if (e instanceof CustomHttpError && e.status === 401) {
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
                        } else {
                            throw e;
                        }
                    }
                } else {
                    throw error; //  throw new Error("특정 사용자 게시글 검색 데이터를 불러오는데 실패하였습니다"); 를 던져서 error.tsx가 실행될 수 있도록
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearch();
    }, [searchTriggerNum]);

    if (!isValidSearch) {
        return <BlogList initialData={[]} isSearch={true} />;
    }

    if (isLoading) return <GlobalLoading />;

    const isExistContent = searchResults.content.length > 0;

    return (
        <Suspense>
            <BlogList initialData={searchResults.content} keyword={keyword} isSearch={true} totalElements={searchResults.totalElements} />
            <Pagination
                isExistContent={isExistContent}
                totalPages={searchResults.totalPages}
                currentPage={searchResults.currentPage}
                blogId={blogId}
            />
        </Suspense>
    );
}
