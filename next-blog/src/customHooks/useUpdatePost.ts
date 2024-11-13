// import { useRouter } from "next/navigation";
import { PostRequest } from "@/types/PostTypes";
import { refreshToken } from "@/utils/refreshToken";
import { useMutation } from "react-query";
// import { toast } from "react-toastify";

function useUpdatePost(id: string, userIdentifier: string) {
    // const queryClient = useQueryClient();
    // const router = useRouter();

    const accessToken = localStorage.getItem("access_token") ?? false;

    return useMutation(
        async (newPost: PostRequest) => {
            const updatePost: (id: string, token: string | boolean) => Promise<Response> = (
                id: string,
                token: string | boolean
            ): Promise<Response> => {
                return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${userIdentifier}/posts/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(newPost),
                });
            };

            let response = await updatePost(id, accessToken);

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Forbidden: You do not have permission to update this post.");
                } else if (response.status === 401) {
                    const newAccessToken = await refreshToken();
                    if (newAccessToken) {
                        response = await updatePost(id, newAccessToken);
                    }
                }  
            }

            if (!response.ok) {
                throw new Error("Failed to write update post please retry again.");
            }

            return response.json();
        },
        // {
        //     // Optimistic Update
        //     onMutate: async (newPost) => {
        //         // 기존 포스트 목록 가져오기
        //         // 기존 쿼리 취소
        //         await queryClient.cancelQueries(["post", id]);

        //         // 기존 게시글 데이터를 캐시에서 가져오기 (특정 게시글의 데이터만 온다)
        //         const previousPost = queryClient.getQueryData(["post", id]);

        //         // 낙관적 업데이트를 위해 임시로 캐시를 업데이트한다.
        //         queryClient.setQueryData(["post", id], (old: any) => ({
        //             ...old,
        //             ...newPost,
        //         }));

        //         // 이전 상태를 반환하여 오류 발생 시 복구할 수 있도록 한다
        //         return { previousPost };
        //     },
        //     // 에러 발생 시 롤백
        //     onError: (err, newPost, context) => {
        //         if (context?.previousPost) {
        //             queryClient.setQueryData(["post", id], context.previousPost);
        //         }
        //         console.error("Error updating post:", err);
        //     },
        //     // 성공 시 쿼리 무효화하여 최신 데이터 가져오기
        //     onSuccess: (data) => {
        //         console.log("수정 응답 데이터", data);
        //         queryClient.invalidateQueries(["post", id]);
        //     },
        //     // 요청 완료 후 실행 (성공, 실패 여부와 상관없음)
        //     onSettled: () => {
        //         queryClient.invalidateQueries(["post", id]);
        //     },
        // }
    );
}

export default useUpdatePost;
