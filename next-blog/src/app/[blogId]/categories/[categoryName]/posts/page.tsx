import React, { Suspense } from "react";

import CategoryPostListWrapper from "./components/CategoryPostListWrapper";
// import { CacheTimes } from "@/constants/cache-constants";

export default async function CategoryPostListPage({ params }: { params: Promise<{ blogId: string; categoryName: string }> }) {
    const { blogId, categoryName } = await params;

    const decodedCategoryName = decodeURIComponent(categoryName);

    return <CategoryPostListWrapper blogId={blogId} categoryName={categoryName} decodedCategoryName={decodedCategoryName} />;
}
