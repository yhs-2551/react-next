import React, { Suspense } from "react";
import BlogList from "./components/BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { CacheTimes } from "@/constants/cache-constants";

export default async function PostListPage({ params }: { params: Promise<{ blogId: string }> }) {
    const { blogId } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?page=0&size=8`, {
        cache: "force-cache",
        next: {
            tags: [`${blogId}-posts`],
            revalidate: CacheTimes.MODERATE.POSTS,
        },
    });

    if (!res.ok) throw new Error("특정 사용자 게시글 목록 데이터를 불러오는데 실패하였습니다.");

    const response = await res.json();

    const { totalPages, content, currentPage, totalElements } = response.data;

    const isExistContent = content.length > 0;

    return (
        // useSearchParams를 사용한 컴포넌트에선 Suspense로 감싸줘야함
        // 공식문서 내용: Suspense로 감싸면 this will ensure the page does not de-opt to client-side rendering.
        // SSR -> CSR로 강제 전환되는 것을 방지. 즉 서버 사이드렌더링을 통해 최적화 유지하기 위함
        <Suspense>
            <BlogList initialData={content} isSearch={false} totalElements={totalElements} />
            <Pagination isExistContent={isExistContent} totalPages={totalPages} currentPage={currentPage} blogId={blogId} />
        </Suspense>
    );
}
