"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePostsAndSearchResults(blogId: string) {
    // 높은 우선순위: 특정 사용자 페이지 포스트 페이지 관련. 비동기 처리
    await Promise.all([revalidatePath(`/${blogId}/posts`), revalidatePath(`/${blogId}/posts/search`)]);
    // 낮은 우선순위: 메인 페이지 관련 비동기 실행하고 완료 대기하지 않음
    Promise.all([revalidatePath("/"), revalidatePath("/search")]).catch((error) => {
        console.error("글로벌 경로 리밸리데이션 실패:", error.message);
    });
}
