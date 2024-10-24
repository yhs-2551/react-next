import React from "react";

import ClientWrapper from "@/providers/ClientWrapper";
import BlogForm from "../../(common)/Form/BlogForm";
 

export default async function PostEditPage({ params }: { params: { id: string } }) {
    const res = await fetch(`http://localhost:8000/api/posts/${params.id}`, {
        cache: "no-store",
    });

    const post = await res.json();
    console.log("블로그 수정 서버 컴포넌트 실행 POST >>>>>>>>>>>>", post);

    return (
        <div className='container max-w-4xl mt-6 mx-auto bg-white'>
            {/* <BlogEditWithProvider initialData={post} postId={params.id}/> */}

            <ClientWrapper>
                <BlogForm initialData={post} postId={params.id} />
            </ClientWrapper>
        </div>
    );
}
