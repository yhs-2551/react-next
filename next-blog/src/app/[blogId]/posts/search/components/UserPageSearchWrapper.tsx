"use client";

import { Suspense, useEffect, useState } from "react";
import BlogList from "../../components/BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { PostsReadBaseProps } from "@/types/PostTypes";
import GlobalLoading from "@/app/loading";
import { useRouter } from "next/navigation";
import { FetchWithAuth } from "@/utils/FetchWithAuth";

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

    const [authError, setAuthError] = useState<Error | null>(null);

    const router = useRouter();

    useEffect(() => {
        if (!isValidSearch) {
            return;
        }

        // 다시 검색했을때 이전 검색 결과가 잠깐 남아있는 현상 방지.
        // 맨 초기에 마운트시 useState<boolean>(true) 초기값이랑 겹쳐서 비효율적일 수 있지만, 재검색 했을때를 고려해야해서 이렇게 남겨둠. 추후에 더 좋은 코드 있으면 변경 예정 
        setIsLoading(true);

        // queryParams는 꼭 서버 컴포넌트에서 건네받은 값을 이용해서 백엔드로 요청 보내야함
        // URL로 page번호 없이 검색하면 page는 백엔드에서 사용하는 기본값으로 처리
        const queryParams = new URLSearchParams({
            // page && { page } => page 존재하면 { page: page } 객체 반환
            // 스프레드 연산자(...)로 객체를 URLSearchParams에 펼침
            ...(page && { page }),
            ...(category && { category }),
            searchType,
            keyword,
        }).toString(); // 클라이언트 컴포넌트에선 .toString() 필수, size는 따로 요청때 숫자값으로 넣어줘야 백엔드에서 받을 수 있음. (서버 컴포넌트 였으면 한번에 처리 가능)

        FetchWithAuth({
            fetchFn: "searchPostsForUserPage",
            blogId,
            queryParams,
            onSuccess: (data: any) => {
                const { content, currentPage, totalPages, totalElements } = data;
                setSearchResults({ content, currentPage, totalPages, totalElements });
            },
            onError: (error: Error) => setAuthError(error),
            onLoading: (loading: boolean) => setIsLoading(loading),
            errorMessage: "특정 사용자 게시글 검색 데이터를 불러오는데 실패하였습니다",
            router,
        });
    }, [keyword, searchType]);

    if (!isValidSearch) {
        return <BlogList initialData={[]} isSearch={true} />;
    }

    if (isLoading) return <GlobalLoading />;

    if (authError) {
        throw authError;
    }

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
