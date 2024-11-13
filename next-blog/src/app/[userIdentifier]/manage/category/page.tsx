import ClientWrapper from "@/providers/ClientWrapper";
import Category from "./components/Category";

export default function CategoryPage() {
 
    return (
        // 카테고리에서만 persist 사용
        <ClientWrapper usePersist={true}>
            <Category />
        </ClientWrapper>
    );
}



// import React from "react";
// import BlogList from "./components/BlogList";

// export default async function PostsPage() {
//     const res = await fetch("http://localhost:8000/api/posts", {
//         cache: "no-store",
//     });

//     const posts = await res.json();

//     console.log("블로그 글 목록 페이지 실행 >>>>>>>>>>>");

//     return <BlogList initialData={posts} />;
// }
