import React from "react";
import BlogList from "./components/BlogList";
import Pagination from "../components/Pagination";
import EmptyState from "./components/search/EmptyState";

export default async function PostListPage({
    params,
    searchParams,
}: {
    params: { blogId: string };
    searchParams: { page?: string; searchType?: string; keyword?: string };
}) {
    const { blogId } = await params;
    const { page, searchType, keyword } = await searchParams;

    const queryParams = new URLSearchParams({
        // page && { page } => page 존재하면 { page: page } 객체 반환
        // 스프레드 연산자(...)로 객체를 URLSearchParams에 펼침
        ...(page && { page }),
        ...(searchType && { searchType }),
        ...(keyword && { keyword }),
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${blogId}/posts?${queryParams}`, { cache: "force-cache" });

    const response = await res.json();

    const { totalPages, content, currentPage } = response.data;

    console.log("content>>>", content);

    return (
        <>
            {content.length === 0 ? (
                <EmptyState keyword={keyword} />
            ) : (
                <>
                    <BlogList initialData={content} blogId={blogId} />
                    <Pagination totalPages={totalPages} currentPage={currentPage} blogId={blogId} />
                </>
            )}
        </>
    );
}
