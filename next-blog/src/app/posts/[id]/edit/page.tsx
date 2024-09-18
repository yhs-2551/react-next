import React from 'react'

import BlogEditWithProvider from "./components/BlogEditWithProvider";

export default async function PostEditPage({ params }: { params: { id: string } }) {
    const res = await fetch(`http://localhost:8000/api/posts/${params.id}`, {
        cache: "no-store",
    });

    const post = await res.json();

    console.log("POST >>>>>>>>>>>>", post);

    return (
        <div className="container max-w-4xl mt-6 mx-auto bg-white">
            <BlogEditWithProvider initialData={post} postId={params.id}/>
        </div>
    )
}

