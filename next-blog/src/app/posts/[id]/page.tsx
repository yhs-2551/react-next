import React from "react";

import BlogDetailWithProvider from "./components/BlogDetailWithProvider";

export default async function PostDetailPage({
    params,
}: {
    params: { id: string };
}) {
    
    const res = await fetch(`http://localhost:8000/api/posts/${params.id}`, {
        cache: "no-store",
    });

    const post = await res.json();
    
    return <BlogDetailWithProvider initialData={post} postId={params.id} />;
}
