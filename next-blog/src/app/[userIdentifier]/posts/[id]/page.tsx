import React from "react";
import BlogDetail from "./components/BlogDetail";
import ClientWrapper from "@/providers/ClientWrapper";
import { notFound } from "next/navigation";

export default async function PostDetailPage({ params }: { params: { id: string, userIdentifier: string } }) {

    const { id, userIdentifier } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${userIdentifier}/posts/${id}`, {
        cache: "no-store",
    });
    
    if (!res.ok) {
        notFound();
    }

    const post = await res.json();

    console.log("블로그 디테일 서버 컴포넌트 실행 >>>>>>>>>>>> ", post);

    return (
        <ClientWrapper>
            <BlogDetail initialData={post} postId={id} />
        </ClientWrapper>
    );
}
