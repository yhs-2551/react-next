import React from "react";

import ClientWrapper from "@/providers/ClientWrapper";
import BlogForm from "../../(common-newpost-editpost)/Form/BlogForm";
import AuthCheck from "@/app/[blogId]/components/AuthCheck";

export default async function PostEditPage({ params }: { params: { id: string; blogId: string } }) {
    const { blogId, id } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${id}`, {
        cache: "no-store",
    });

    const post = await res.json();
    console.log("블로그 수정 서버 컴포넌트 실행 POST >>>>>>>>>>>>", post);

    return (
        <div className='container max-w-4xl mt-6 mx-auto bg-white'>
            <ClientWrapper usePersist={true}>
                <AuthCheck>
                    <BlogForm initialData={post} postId={id} />
                </AuthCheck>
            </ClientWrapper>
        </div>
    );
}
