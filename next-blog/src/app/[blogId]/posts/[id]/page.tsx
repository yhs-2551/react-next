import React from "react";
import BlogDetail from "./components/BlogDetail";
import ClientWrapper from "@/providers/ClientWrapper";
import { notFound } from "next/navigation";
// import { CacheTimes } from "@/constants/cache-constants";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string; blogId: string }> }) {
    const { id, blogId } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${id}`, {
        cache: "no-cache",
        // next: {
        //     tags: [`${blogId}-post-${id}-detail`],
        //     revalidate: CacheTimes.MODERATE.POST_DETAIL
        // }
    });

    if (!res.ok && res.status === 404) {
        notFound();
    } else if (!res.ok) {
        throw new Error("특정 사용자 게시글 데이터를 불러오는데 실패하였습니다.");
    }

    const response = await res.json();

    console.log("상세페이지 데이터", response.data);

    return (
        <ClientWrapper>
            <BlogDetail initialData={response.data} postId={id} />
        </ClientWrapper>
    );
}
