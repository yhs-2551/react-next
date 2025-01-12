import React, { Suspense } from "react";

import BlogList from "@/app/[blogId]/posts/components/BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { notFound } from "next/navigation";
import { CacheTimes } from "@/constants/cache-constants";

export default async function PostListByCategoryPaginationPage({
    params,
}: {
    params: Promise<{ blogId: string; pageNum: string; categoryName: string }>;
}) {
    const { blogId, categoryName, pageNum } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories/${categoryName}/posts/page/${pageNum}?size=8`,
        {
            cache: "force-cache",
            next: { tags: ["posts-categories-pagination"], revalidate: CacheTimes.MODERATE.POSTS_CATEGORY_PAGINATION },
        }
    );

    if (!res.ok) {
        notFound();
    }

    const response = await res.json();

    const { totalPages, content, currentPage, totalElements } = response.data;

    const isExistContent = content.length > 0;

    const decodedCategoryName = decodeURIComponent(categoryName);

    return (
        <Suspense>
            <BlogList initialData={content} isSearch={false} totalElements={totalElements} />
            <Pagination
                isExistContent={isExistContent}
                totalPages={totalPages}
                currentPage={currentPage}
                blogId={blogId}
                category={decodedCategoryName}
            />
        </Suspense>
    );
}
