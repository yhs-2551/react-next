import React, { Suspense } from "react";
import BlogList from "../../components/BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { notFound } from "next/navigation";
// import { CacheTimes } from "@/constants/cache-constants";

export default async function PostListPaginationPage({ params }: { params: Promise<{ blogId: string; pageNum: string }> }) {
    const { blogId, pageNum } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/page/${pageNum}?size=8`, {
        cache: "no-cache",
        // next: { tags: ["posts-pagination"], revalidate: CacheTimes.MODERATE.POSTS_PAGINATION },
    });

    if (!res.ok && res.status === 404) {
        notFound();
    } else if (!res.ok) {
        throw new Error("특정 사용자 페이지네이션 목록 데이터를 불러오는데 실패하였습니다.");
    }

    const response = await res.json();

    const { totalPages, content, currentPage, totalElements } = response.data;

    const isExistContent = content.length > 0;

    return (
        <Suspense>
            <BlogList initialData={content} isSearch={false} totalElements={totalElements} />
            <Pagination isExistContent={isExistContent} totalPages={totalPages} currentPage={currentPage} blogId={blogId} />
        </Suspense>
    );
}
