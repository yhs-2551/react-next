import React from "react";

import BlogListWithProvider from "./components/BlogListWithProvider";

export default async function PostsPage() {
    const res = await fetch("http://localhost:8000/api/posts", {
        cache: "no-store",
    });

    const posts = await res.json();
    

    return <BlogListWithProvider initialData={posts} />;
}
