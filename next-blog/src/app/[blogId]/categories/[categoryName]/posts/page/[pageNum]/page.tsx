import React, { Suspense } from "react";

import CategoryPaginationPostListWrapper from "./components/CategoryPaginationPostListWrapper";
// import { CacheTimes } from "@/constants/cache-constants";

export default async function PostListByCategoryPaginationPage({
    params,
}: {
    params: Promise<{ blogId: string; pageNum: string; categoryName: string }>;
}) {
    const { blogId, categoryName, pageNum } = await params;

    const decodedCategoryName = decodeURIComponent(categoryName);

    return (
        <CategoryPaginationPostListWrapper blogId={blogId} categoryName={categoryName} decodedCategoryName={decodedCategoryName} pageNum={pageNum} />
    );
}
