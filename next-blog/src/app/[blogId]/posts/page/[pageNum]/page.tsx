import React, { Suspense } from "react";
import BlogList from "../../components/BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { CacheTimes } from "@/constants/cache-constants";

export default async function PostListPaginationPage({ params }: { params: Promise<{ blogId: string; pageNum: string }> }) {
    const { blogId, pageNum } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/page/${pageNum}?size=8`, {
        cache: "force-cache",
        next: { tags: ["posts-pagination"], revalidate: CacheTimes.MODERATE.POSTS_PAGINATION },
    });

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
