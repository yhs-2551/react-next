import React from "react";
import BlogList from "./components/BlogList";
import Pagination from "@/app/_components/pagination/Pagination";

export default async function PostListPage({
    params,
    searchParams,
}: {
    params: Promise<{ blogId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { blogId } = await params;
    const { page } = await searchParams;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?page=${page}&size=8`, {
        cache: "force-cache",
    });

    const response = await res.json();

    const { totalPages, content, currentPage, totalElements } = response.data;

    return (
        <>
            <BlogList initialData={content} blogId={blogId} isSearch={false} totalElements={totalElements}/>
            <Pagination totalPages={totalPages} currentPage={currentPage} blogId={blogId} />
        </>
    );
}
