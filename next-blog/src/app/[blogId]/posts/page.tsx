import React, { Suspense } from "react";  
import UserPagePostListWrapper from "./components/UserPagePostListWrapper";

export default async function PostListPage({ params }: { params: Promise<{ blogId: string }> }) {
    const { blogId } = await params;

    return <UserPagePostListWrapper blogId={blogId} />;
}
