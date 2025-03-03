"use client";

import { useEffect, useState } from "react";
import { PostResponse } from "@/types/PostTypes";
import GlobalLoading from "@/app/loading";
import { fetchPostEditDetail } from "@/actions/post.actions";
import BlogForm from "@/app/_components/form/BlogForm";
import { useRouter } from "next/navigation";

export default function UserPagePostEditDetailWrapper({ blogId, postId }: { blogId: string; postId: string }) {
    const [post, setPost] = useState<PostResponse>({
        title: "",
        content: "",
        postStatus: "PUBLIC",
        categoryName: "",
        tags: [],
        files: [],
        featuredImage: {
            fileName: "",
            fileUrl: "",
            fileType: "",
            fileSize: 0,
        },
    });

    const [authError, setAuthError] = useState<Error | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            // AuthCheck에서 검증을 끝냈기 때문에 여기에선 무조건 access_token이 있음
            const token = localStorage.getItem("access_token") as string;

            try {
                setIsLoading(true);
                const response = await fetchPostEditDetail(blogId, postId, token);
                setPost(response.data);
            } catch (error: unknown) {
                if (error instanceof Error && error.message.includes("서버")) {
                    setAuthError(new Error("수정 페이지 데이터를 불러오는데 실패"));
                    return;
                } else if (error instanceof Error && error.message.includes("게시글을 찾을 수 없습니다")) {
                    router.push(`/404`);
                }
            }
        };

        fetchData().then(() => {
            setIsLoading(false);
        });
    }, [blogId]);

    if (isLoading) return <GlobalLoading />;

    if (authError) {
        throw authError;
    }

    return (
        <>
            <BlogForm initialData={post} postId={postId} />
        </>
    );
}
