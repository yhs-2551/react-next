import React from "react";

import ClientWrapper from "@/providers/ClientWrapper";
import AuthCheck from "@/app/[blogId]/components/AuthCheck";
import BlogForm from "@/app/_components/form/BlogForm";
import { notFound } from "next/navigation";
// import { CacheTimes } from "@/constants/cache-constants";

export default async function PostEditPage({ params }: { params: Promise<{ id: string; blogId: string }> }) {
    const { blogId, id } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${id}/edit`, {
        cache: "no-cache",
        // next: {
        //     tags: [`${blogId}-post-${id}-edit`],
        //     revalidate: CacheTimes.MODERATE.POST_EDIT,
        // },
    });

    if (!res.ok && res.status === 404) {
        notFound();
    } else if (!res.ok) {
        throw new Error("특정 사용자 게시글 데이터를 불러오는데 실패하였습니다. - 수정 페이지");
    }

    const response = await res.json();  

    return (
        <div className='container max-w-4xl mt-[120px] mx-auto bg-white'>
            <ClientWrapper>
                <AuthCheck>
                    <BlogForm initialData={response.data} postId={id} />
                </AuthCheck>
            </ClientWrapper>
        </div>
    ); 
}
