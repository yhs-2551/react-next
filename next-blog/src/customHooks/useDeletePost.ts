import { CustomHttpError } from "@/utils/CustomHttpError"; 
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { refreshToken } from "@/services/api";

const deletePost: (postId: string, accessToken: string | null, blogId: string) => Promise<Response> = async (
    postId: string,
    accessToken: string | null,
    blogId: string
): Promise<Response> => {
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${postId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });
};

// 내부함수인 useMutation를 실행할때 postId, blogId, accessToken은 클로져로 참조 가능.
function useDeletePost(postId: string, blogId: string) {
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setAccessToken(token);
    }, []);

    return useMutation({
        mutationFn: async () => {
            if (accessToken === null) return;

            let response = await deletePost(postId, accessToken, blogId);

            if (!response.ok) {
                if (response.status === 401) {
                    try {
                        const newAccessToken = await refreshToken();
                        if (newAccessToken) {
                            response = await deletePost(postId, newAccessToken, blogId);
                        }
                    } catch (error: unknown) {
                        // 리프레시 토큰 까지 만료되면 재로그인 필요
                        if (error instanceof CustomHttpError) {
                            setAccessToken(null);
                            throw new CustomHttpError(error.status, "세션이 만료되었습니다.\n재로그인 해주세요.");
                        }
                    }
                }
            }

            if (!response.ok && response.status === 500) {
                throw new CustomHttpError(response.status, "게시글 삭제에 실패하였습니다. 잠시 뒤에 다시 시도해주세요.");
            }

            const responseData = await response.json();
            return {
                message: responseData.message,
            };
        },
        // {
        //     onSuccess: () => {
        //         // 포스트 목록을 다시 불러오게 만듦
        //         queryClient.invalidateQueries(["posts"]);

        //         // 삭제 성공 시 게시글 목록 페이지로 리다이렉트
        //         router.push("/posts");

        //         console.log("Post deleted successfully");
        //     },
        //     onError: (error: Error) => {
        //         console.error("Error deleting post:", error.message);
        //     },
        //     onSettled: () => {
        //         // 포스트 목록을 다시 불러오게 만듦
        //         queryClient.invalidateQueries(["posts"]);
        //     },
        // }
    });
}

export default useDeletePost;
