"use server";

import { revalidatePath, revalidateTag } from "next/cache";

// 서버액션은 무조건 async function으로 만들어야 함
// revalidateTag를 실행하면 관련있는 해당 서버 컴포넌트 재실행, revalidatePath는 실험해보지 않았지만 Tag와 같이 서버컴포넌트 재실행할것 같음
export async function revalidatePostsAndSearch(blogId: string) {
    try {
        // 특정 사용자 페이지
        revalidatePath(`/${blogId}/posts`);
        revalidatePath(`/${blogId}/posts/search`);

        // 메인 페이지
        revalidatePath("/");
        revalidatePath("/search");
    } catch (error) {
        console.error("revalidatePostsAndSearch 캐시 무효화 실패:", error);
    }
}

export async function revalidateInfiniteScroll() {
    try {
        revalidateTag("infinite-scroll-posts");
    } catch (error) {
        console.error("revalidateInfiniteScroll 캐시 무효화 실패:", error);
    }
}

export async function revalidatePagination() {
    try {
        revalidateTag("posts-pagination");
    } catch (error) {
        console.error("revalidatePagination 캐시 무효화 실패:", error);
    }
}

export async function revalidateCategories(blogId: string) {
    try {
        revalidateTag(`${blogId}-categories`);
    } catch (error) {
        console.error("revalidateCategories 캐시 무효화 실패:", error);
    }
}

export async function revalidatePostsCategories() {
    try {
        revalidateTag("posts-categories");
    } catch (error) {
        console.error("revalidatePostsCategories 캐시 무효화 실패:", error);
    }
}
 
export async function revalidatePostsCategoriesPagination() {
    try {
        revalidateTag("posts-categories-pagination");
    } catch (error) {
        console.error("revalidatePostsCategoriesPagination 캐시 무효화 실패:", error);
    }
}

export async function revalidatePostDetailPage(blogId: string, postId: string) {
    try {
        revalidateTag(`${blogId}-post-${postId}-detail`);
    } catch (error) {
        console.error("revalidatePostDetailPage 캐시 무효화 실패:", error);
    }
}

export async function revalidatePostEditPage(blogId: string, postId: string) {
    try {
        revalidateTag(`${blogId}-post-${postId}-edit`);
    } catch (error) {
        console.error("revalidatePostDetailPage 캐시 무효화 실패:", error);
    }
}
 