import React from "react";
import BlogDetail from "./components/BlogDetail";
import ClientWrapper from "@/providers/ClientWrapper";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
    const res = await fetch(`http://localhost:8000/api/posts/${params.id}`, {
        cache: "no-store",
    });

    const post = await res.json();

    console.log("블로그 디테일 서버 컴포넌트 실행 >>>>>>>>>>>> ", post);

    return (
        <ClientWrapper>
            <BlogDetail initialData={post} postId={params.id} />
        </ClientWrapper>
    );
}
