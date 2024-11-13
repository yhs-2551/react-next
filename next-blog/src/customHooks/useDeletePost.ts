import { refreshToken } from "@/utils/refreshToken";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "react-query";

import "react-toastify/dist/ReactToastify.css";

const deletePost: (postId: string, accessToken: string | boolean, userIdentifier: string) => Promise<Response> = async (
    postId: string,
    accessToken: string | boolean,
    userIdentifier: string
): Promise<Response> => {
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${userIdentifier}/posts/${postId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });
};

// 내부함수인 useMutation를 실행할때 postId, userIdentifier, accessToken은 클로져로 참조 가능. 
function useDeletePost(postId: string, userIdentifier: string) {
    const accessToken = localStorage.getItem("access_token") ?? false;

    return useMutation(
        async () => {
            let response = await deletePost(postId, accessToken, userIdentifier);

            if (!response.ok) {
                if (response.status === 401) {
                    const newAccessToken = await refreshToken();
                    if (newAccessToken) {
                        response = await deletePost(postId, newAccessToken, userIdentifier);
                    }
                }
            }

            if (!response.ok) {
                throw new Error("Failed to delete post. Please retry again.");
            }

            return await response.text();
        }
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
    );
}

export default useDeletePost;
