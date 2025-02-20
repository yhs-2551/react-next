import React, { Suspense } from "react";

import Pagination from "@/app/_components/pagination/Pagination";
import BlogList from "@/app/[blogId]/posts/components/BlogList";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
// import { CacheTimes } from "@/constants/cache-constants";

export default async function CategoryPostListPage({ params }: { params: Promise<{ blogId: string; categoryName: string }> }) {
    const { blogId, categoryName } = await params;
    const cookieStore = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories/${categoryName}/posts?size=8`,
        {
            cache: "no-cache",
            // next: {
            //     tags: ["posts-categories"],
            //     revalidate: CacheTimes.MODERATE.POSTS_CATEGORY,
            // },
            headers: {
                Cookie: cookieStore.toString(),
            },
        }
    );

    if (!res.ok && res.status === 404) {
        notFound();
    } else if (!res.ok) {
        throw new Error("특정 사용자의 카테고리 목록 데이터를 불러오는데 실패하였습니다.");
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
