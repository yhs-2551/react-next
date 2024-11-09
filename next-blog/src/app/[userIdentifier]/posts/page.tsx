import React from "react";
import BlogList from "./components/BlogList";

export default async function PostListPage({ params }: { params: { userIdentifier: string } }) {
    const { userIdentifier } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts/${userIdentifier}`, {
        cache: "no-store",
    });

    const posts = await res.json();

    console.log("블로그 글 목록 페이지 실행 >>>>>>>>>>>");

    return <BlogList initialData={posts} userIdentifier={userIdentifier} />;
}
