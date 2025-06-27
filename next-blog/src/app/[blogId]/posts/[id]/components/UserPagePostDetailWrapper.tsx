"use client";

import { useEffect, useState } from "react";
import { PostResponse } from "@/types/PostTypes"; 
import ClientWrapper from "@/providers/ClientWrapper";
import BlogDetail from "./BlogDetail";
import { useRouter } from "next/navigation";
import { FetchWithAuth } from "@/utils/FetchWithAuth";
import BlogLoading from "@/app/[blogId]/loading";

export default function UserPagePostDetailWrapper({ blogId, postId }: { blogId: string; postId: string }) {
    const [post, setPost] = useState<PostResponse>({
        username: "",
        title: "",
        content: "",
        postStatus: "PUBLIC",
        categoryName: "",
        tags: [],
        files: [],
        createdAt: "",
    });

    const [authError, setAuthError] = useState<Error | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        FetchWithAuth<PostResponse>({
            fetchFn: "fetchPostDetail",
            blogId,
            postId,
            onSuccess: (data: PostResponse) => setPost(data),
            onError: (error: Error) => setAuthError(error),
            onLoading: (loading: boolean) => setIsLoading(loading),
            errorMessage: "특정 사용자 상세 페이지 게시글 데이터를 불러오는데 실패하였습니다.",
            router,
        });
    }, [blogId]);

    if (isLoading) return <BlogLoading />;

    if (authError) {
        throw authError;
    }

    return (
        <>
            <ClientWrapper>
                <BlogDetail initialData={post} postId={postId} />
            </ClientWrapper>
        </>
    );
}
