import { refreshToken } from "@/services/api";
import { PostRequest } from "@/types/PostTypes";
import { CustomHttpError } from "@/utils/CustomHttpError"; 
import { useMutation } from "@tanstack/react-query";

function useUpdatePost(id: string, blogId: string) {
    const accessToken = localStorage.getItem("access_token") ?? false;

    return useMutation({
        mutationFn: async (newPost: PostRequest) => {
            const updatePost: (id: string, token: string | boolean) => Promise<Response> = (
                id: string,
                token: string | boolean
            ): Promise<Response> => {
                return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${id}`, {
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
                    throw new CustomHttpError(response.status, "게시글을 수정할 권한이 없습니다.");
                } else if (response.status === 401) {
                    try {
                        const newAccessToken = await refreshToken();
                        if (newAccessToken) {
                            response = await updatePost(id, newAccessToken);
                        }
                    } catch (error: unknown) {
                        if (error instanceof CustomHttpError) {
                            // 리프레시 토큰 까지 만료되어서 재로그인 필요
                            throw new CustomHttpError(error.status, "세션이 만료되었습니다. \n로그아웃 이후 재로그인 해주세요.");
                        }
                    }
                }
            }

            if (!response.ok && response.status === 500) {
                throw new CustomHttpError(response.status, "서버측 오류로 인해 일시적으로 게시글 수정이 불가능합니다. 잠시 후 다시 시도해주세요.");
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
    });
}

export default useUpdatePost;
