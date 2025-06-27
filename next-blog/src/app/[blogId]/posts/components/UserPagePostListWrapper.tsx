"use client";

import { Suspense, useEffect, useState } from "react";
import BlogList from "./BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { PostsReadBaseProps } from "@/types/PostTypes";
 
import { FetchWithAuth } from "@/utils/FetchWithAuth";
import BlogLoading from "../../loading";

export default function UserPagePostListWrapper({ blogId }: { blogId: string }) {
    const [posts, setPosts] = useState<PostsReadBaseProps>({
        content: [],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [authError, setAuthError] = useState<Error | null>(null);

    useEffect(() => {
        FetchWithAuth({
            fetchFn: "fetchSpecificUserPosts",
            blogId,
            onSuccess: (data: any) => {
                const { content, totalPages, currentPage, totalElements } = data;
                setPosts({ content, totalPages, currentPage, totalElements });
            },
            onError: (error: Error) => setAuthError(error),
            onLoading: (loading: boolean) => setIsLoading(loading),
            errorMessage: "특정 사용자 게시글 목록 데이터를 불러오는데 실패하였습니다.",
        });
    }, [blogId]);

    if (isLoading) return <BlogLoading />;

    if (authError) {
        throw authError;
    }

    const isExistContent = posts.content.length > 0;

    return (
        <>
            {/* useSearchParams를 사용한 컴포넌트에선 Suspense로 감싸줘야함
            공식문서 내용: Suspense로 감싸면 this will ensure the page does not de-opt to client-side rendering.
            SSR -> CSR로 강제 전환되는 것을 방지. 즉 서버 사이드렌더링을 통해 최적화 유지하기 위함 */}
            <Suspense>
                <BlogList initialData={posts.content} isSearch={false} totalElements={posts.totalElements} />
                <Pagination isExistContent={isExistContent} totalPages={posts.totalPages} currentPage={posts.currentPage} blogId={blogId} />
            </Suspense>
        </>
    );
}
