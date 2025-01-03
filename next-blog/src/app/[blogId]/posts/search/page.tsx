import React from "react";
import BlogList from "../components/BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { notFound } from "next/navigation";

export default async function PostSearchResultsPage({
    params,
    searchParams,
}: {
    params: Promise<{ blogId: string; categoryName: string }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const { blogId } = await params;
    const { page, searchType, keyword, category } = await searchParams;

    const isValidSearch = searchType && keyword;

    if (!isValidSearch) {
        return <BlogList initialData={[]} isSearch={true} />;
    }

    // URL로 page번호 없이 검색하면 page는 백엔드에서 사용하는 기본값으로 처리
    const queryParams = new URLSearchParams({
        // page && { page } => page 존재하면 { page: page } 객체 반환
        // 스프레드 연산자(...)로 객체를 URLSearchParams에 펼침
        ...(page && { page }),
        ...(category && { category }),
        searchType,
        keyword,
        size: "8",
    });
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?${queryParams}`, {
        cache: "force-cache"
    });

    if (!res.ok) {
        notFound();
    }

    const response = await res.json();

    const { totalPages, content, currentPage, totalElements } = response.data;

    const isExistContent = content.length > 0;

    return (
        <>
            <BlogList initialData={content} keyword={keyword} isSearch={true} totalElements={totalElements} />
            <Pagination isExistContent={isExistContent} totalPages={totalPages} currentPage={currentPage} blogId={blogId} />
        </>
    );
}
