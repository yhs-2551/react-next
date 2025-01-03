import React from "react";

import Pagination from "@/app/_components/pagination/Pagination";
import BlogList from "@/app/[blogId]/posts/components/BlogList";
import { notFound } from "next/navigation";

export default async function CategoryPostListPage({ params }: { params: Promise<{ blogId: string; categoryName: string }> }) {
    const { blogId, categoryName } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories/${categoryName}/posts?size=8`,
        {
            cache: "force-cache",
            next: {
                tags: ["posts-categories"],
            },
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
        <>
            <BlogList initialData={content} isSearch={false} totalElements={totalElements} />
            <Pagination
                isExistContent={isExistContent}
                totalPages={totalPages}
                currentPage={currentPage}
                blogId={blogId}
                category={decodedCategoryName}
            />
        </>
    );
}
