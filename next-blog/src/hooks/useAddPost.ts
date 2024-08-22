"use client"

import { useMutation, useQueryClient } from 'react-query';

interface NewPost {
    title: string;
    content: string; 
    tags: string[]; 
    category: string;
    postStatus: string;
}

function useAddPost() {
    const queryClient = useQueryClient();

    return useMutation(
        (newPost: NewPost) => fetch('http://localhost:8000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        }).then(res => res.json()),
        {
            // Optimistic Update 
            onMutate: async newPost => {
                // 기존 포스트 목록 가져오기
                await queryClient.cancelQueries('posts');
                const previousPosts = queryClient.getQueryData('posts');

                // Optimistic Update: 새로운 포스트를 기존 목록에 추가. 즉 서버로 요청을 보내기 전에 새로운 포스트를 미리 캐시에 추가한다.
                queryClient.setQueryData('posts', (old: any) => [...(old || []), newPost]);

                // 이전 상태를 반환하여 오류 발생 시 복구 가능하게 함
                return { previousPosts };
            },
            // 에러 발생 시 롤백
            onError: (err, newPost, context) => {
                if (context?.previousPosts) {
                    queryClient.setQueryData('posts', context.previousPosts);
                }
            },
            // 성공 시 쿼리 무효화하여 최신 데이터 가져오기
            onSuccess: (data) => {
                console.log("응답 데이터", data);
                queryClient.invalidateQueries('posts');
            },
            // 요청 완료 후 실행 (성공, 실패 여부와 상관없음)
            onSettled: () => {
                // queryClient.invalidateQueries('posts');
            },
        }
    );
}

export default useAddPost;