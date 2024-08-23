import { usePosts } from "@/hooks/useGetPosts";
import React from 'react'
import PostItem from "./PostItem";

function BlogList() {

    const { data: posts, isLoading, error } = usePosts();

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold text-center mb-8">전체 글</h2>


{/* any 타입 나중에 수정 */}
            {posts?.map((post: any) => (
                <PostItem key={post.id} title={post.title} content={post.content} createdAt={post.createdAt} views={post.views} />
            ))}
        </div>
    )
}

export default BlogList;

