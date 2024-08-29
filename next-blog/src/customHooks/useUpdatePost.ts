 
import { useMutation, useQueryClient } from "react-query";

interface NewPost {
    title: string;
    content: string;
    tags: string[];
    categoryName: string;
    postStatus: string;
}

function useUpdatePost(id: string) {
    const queryClient = useQueryClient();

    return useMutation(
        (newPost: NewPost) =>
            fetch(`http://localhost:8000/api/posts/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newPost),
            }).then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(JSON.stringify(errorData));
                }

                return res.json();
            }),
        {
            // Optimistic Update
            onMutate: async (newPost) => {
                // 기존 포스트 목록 가져오기
                // 기존 쿼리 취소
                await queryClient.cancelQueries(["post", id]);

                // 기존 게시글 데이터 가져오기 (특정 게시글의 데이터만 가져옵니다)
                const previousPost = queryClient.getQueryData(["post", id]);

                // 이전 상태를 반환하여 오류 발생 시 복구할 수 있도록 합니다.
                return { previousPost };
            },
            // 에러 발생 시 롤백
            onError: (err, newPost, context) => {
                if (context?.previousPost) {
                    queryClient.setQueryData(["post", id], context.previousPost);
                }
                console.log("에러 발생");
            },
            // 성공 시 쿼리 무효화하여 최신 데이터 가져오기
            onSuccess: (data) => {
                console.log("수정 응답 데이터", data);
                queryClient.invalidateQueries(["posts"]);
            },
            // 요청 완료 후 실행 (성공, 실패 여부와 상관없음)
            onSettled: () => {
                queryClient.invalidateQueries(["posts"]);
            },
        }
    );
}

export default useUpdatePost;
