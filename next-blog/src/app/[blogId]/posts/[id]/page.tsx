import React from "react";
import UserPagePostDetailWrapper from "./components/UserPagePostDetailWrapper";
// import { CacheTimes } from "@/constants/cache-constants";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string; blogId: string }> }) {
    const { id, blogId } = await params;

    return <UserPagePostDetailWrapper blogId={blogId} postId={id} />;
}
