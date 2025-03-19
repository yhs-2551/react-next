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
        // 수정 페이지는 워낙 간결하기 때문에 FetchWithAuth 유틸리티 컴포넌트를 사용하지 않음
        // 수정 페이지는 AuthCheck에서 이미 블로그 주인 검증 및 리프레시 토큰을 이용한 액세스 토큰 재발급까지 끝냈기 때문에 해당 사용자만 요청할 수 있음. 따라서 401처리 필요 없고, 액세스 토큰이 무조건 존재
        const fetchData = async () => {
            // AuthCheck에서 검증을 끝냈기 때문에 여기에선 무조건 access_token이 있음
            const token = localStorage.getItem("access_token") as string;

            setIsLoading(true);
            const response = await fetchPostEditDetail(blogId, postId, token);

            if (response.success === false) {
                if (response.status === 404) {
                    router.push(`/404`);
                } else if (response.status === 500) {
                    setAuthError(new Error("수정 페이지 데이터를 불러오는데 실패"));
                    return;
                }
            }

            setPost(response.data);
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
