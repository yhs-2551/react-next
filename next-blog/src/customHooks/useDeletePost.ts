
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMutation, useQueryClient } from "react-query";

import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';




function useDeletePost() {
    const queryClient = useQueryClient();
    const router = useRouter();

    const accessToken = localStorage.getItem("access_token");

    // 처음에는 false로 설정. 세션 만료 알림 후 true로 변경. 즉 사용자가 두 번째 클릭시 로그인 페이지로 리다이렉트.
    const [hasSessionExpired, setHasSessionExpired] = useState(false);

    return useMutation(
        async (postId: string) => {
            const response = await fetch(
                `http://localhost:8000/api/posts/${postId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(
                        "Forbidden: You do not have permission to delete this post."
                    );
                } else if (response.status === 401) {
                   
                        localStorage.removeItem("access_token");
                         
                        toast.error("Your session has expired.", {
                            position: "top-center",
                            autoClose: 3000,
                            onClose: () => router.push("/login"),
                        })
                    

                    throw new Error(
                        "Unauthorized: Your session has expired. You need to log in to delete this post."
                    );

                } else {
                    throw new Error("Failed to delete the post.");
                }
            }
        },
        {
            onError: (error: Error) => {
                console.error("Error deleting post:", error.message);
            },
            onSuccess: () => {
                // 포스트 목록을 다시 불러오게 만듦
                queryClient.invalidateQueries(["posts"]);

                // 삭제 성공 시 게시글 목록 페이지로 리다이렉트
                router.push("/posts");

                console.log("실행 삭제");

                console.log("Post deleted successfully");
            },
        }
    );
}

export default useDeletePost;
