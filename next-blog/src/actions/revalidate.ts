"use server";

import { revalidatePath, revalidateTag } from "next/cache";

// 서버액션은 무조건 async function으로 만들어야 함
export async function revalidatePostsAndSearch(blogId: string) {
    try {
        // 특정 사용자 페이지
        revalidatePath(`/${blogId}/posts`);
        revalidatePath(`/${blogId}/posts/search`);

        // 메인 페이지지
        revalidatePath("/");
        revalidatePath("/search");
    } catch (error) {
        console.error("revalidatePostsAndSearch 캐시 무효화 실패:", error);
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

