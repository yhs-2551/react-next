"use client";

import { Suspense, useEffect, useState } from "react";
import Pagination from "@/app/_components/pagination/Pagination";
import { PostsReadBaseProps } from "@/types/PostTypes";
import BlogList from "../../../components/BlogList";
import { useRouter } from "next/navigation";
import { FetchWithAuth } from "@/utils/FetchWithAuth";
import BlogLoading from "@/app/[blogId]/loading";

export default function UserPagePostListPaginationWrapper({ blogId, pageNum }: { blogId: string; pageNum: string }) {
    const [posts, setPosts] = useState<PostsReadBaseProps>({
        content: [],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [authError, setAuthError] = useState<Error | null>(null);

    const router = useRouter();

    useEffect(() => {
        FetchWithAuth({
            fetchFn: "fetchSpecificUserPaginationPosts",
            blogId,
            pageNum,
            onSuccess: (data: any) => {
                const { content, totalPages, currentPage, totalElements } = data;
                setPosts({ content, totalPages, currentPage, totalElements });
            },
            onError: (error: Error) => setAuthError(error),
            onLoading: (loading: boolean) => setIsLoading(loading),
            errorMessage: "특정 사용자 페이지네이션 목록 데이터를 불러오는데 실패하였습니다.",
            router,
        });
    }, [blogId]);

    if (isLoading) return <BlogLoading />;

    if (authError) {
        throw authError;
    }

    const isExistContent = posts.content.length > 0;

    return (
        <>
            <Suspense>
                <BlogList initialData={posts.content} isSearch={false} totalElements={posts.totalElements} />
                <Pagination isExistContent={isExistContent} totalPages={posts.totalPages} currentPage={posts.currentPage} blogId={blogId} />
            </Suspense>
        </>
    );
}
