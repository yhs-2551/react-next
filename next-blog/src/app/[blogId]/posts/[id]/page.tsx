import React from "react";
import BlogDetail from "./components/BlogDetail";
import ClientWrapper from "@/providers/ClientWrapper";
import { notFound } from "next/navigation";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string; blogId: string }> }) {
    const { id, blogId } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        notFound();
    }

    const post = await res.json();

    return (
        <ClientWrapper>
            <BlogDetail initialData={post} postId={id} />
        </ClientWrapper>
    );
}
