import React, { Suspense } from "react"; 
import UserPagePostListPaginationWrapper from "./components/UserPagePostListPaginationWrapper"; 

export default async function PostListPaginationPage({ params }: { params: Promise<{ blogId: string; pageNum: string }> }) {
    const { blogId, pageNum } = await params;

    return <UserPagePostListPaginationWrapper blogId={blogId} pageNum={pageNum} />;
}
