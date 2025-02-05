"use server";

import { revalidatePath, revalidateTag } from "next/cache";

// 서버액션은 무조건 async function으로 만들어야 함
// revalidateTag를 실행하면 관련있는 해당 서버 컴포넌트 재실행, revalidatePath는 실험해보지 않았지만 Tag와 같이 서버컴포넌트 재실행할것 같음
// export async function revalidatePostsAndSearch(blogId: string) {
//     try {
//         // 특정 사용자 페이지
//         revalidatePath(`/${blogId}/posts`);
//         revalidatePath(`/${blogId}/posts/search`);

//         // 메인 페이지
//         revalidatePath("/");
//         revalidatePath("/search");
//     } catch (error) {
//         console.error("revalidatePostsAndSearch 캐시 무효화 실패:", error);
//     }
// }

export async function revalidateUserPostsList(blogId: string) {
    try {
        revalidateTag(`${blogId}-posts`);
    } catch (error) {
        console.error("revalidateUserPostsList", error);
    }
}

export async function revalidateUserPostsSearchResults(blogId: string) {
    try {
        revalidateTag(`${blogId}-posts-search`);
    } catch (error) {
        console.error("revalidateUserSearchResults", error);
    }
}

export async function revalidateIndexPosts() {
    try {
        revalidateTag("index-posts");
    } catch (error) {
        console.error("revalidateUserPostsList", error);
    }
}

export async function revalidateIndexSearchResults() {
    try {
        revalidateTag("index-posts-search");
    } catch (error) {
        console.error("revalidateIndexSearchResults", error);
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

export async function revalidatePostsCategories(blogId: string) {
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

// 검색 자동 완성 5개 무효화 관련

export async function revalidateUserPostsSearchSuggestions(blogId: string) {
    try {
        revalidateTag(`${blogId}-search-suggestions`);
    } catch (error) {
        console.error("revalidateUserPostsSearchSuggestions 캐시 무효화 실패:", error);
    }
}

export async function revalidateCategoriesSearchSuggestions(blogId: string) {
    try {
        revalidateTag(`${blogId}-categories-search-suggestions`);
    } catch (error) {
        console.error("revalidateCategoriesSearchSuggestions 캐시 무효화 실패:", error);
    }
}

export async function revalidateIndexPostsSearchSuggestions() {
    try {
        revalidateTag("index-search-suggestions");
    } catch (error) {
        console.error("revalidateIndexPostsSearchSuggestions 캐시 무효화 실패:", error);
    }
}

// 현재 세개 두개만 사용 


export async function revalidateCategories(blogId: string) {
    try {
        revalidateTag(`${blogId}-categories`);
    } catch (error) {
        console.error("revalidateCategories 캐시 무효화 실패:", error);
    }
}


export async function revalidateUserProfile() {
    try {
        revalidateTag("private-profile");
        revalidateTag("public-profile");
    } catch (error) {
        console.error("revalidateUserProfile 캐시 무효화 실패:", error);
    }
}


export async function revalidatePostsAndCategories(blogId: string) {
    try {
        revalidateTag(`${blogId}-posts`);
        revalidateTag(`${blogId}-categories`);
        // blogId 체크해서 사용자 존재 여부 확인하는건, 저장 공간만 신경써서 revalidate시간으로 자동 만료되게. blogId는 아직 변할 수 없기 때문에 무효화할 필요 없음
    } catch (error) {
        console.error("revalidateCache 캐시 무효화 실패:", error);
    }
}

// export async function revalidateAllRelatedCaches(blogId: string) {
//     try {

//         // 사용자 게시글, 사용자 게시글 검색 결과 페이지 관련 무효화
//         revalidateTag(`${blogId}-posts`);
//         revalidateTag(`${blogId}-posts-search`);

//         // 메인 페이지, 메인 페이지 검색 결과 페이지 관련 무효화
//         revalidateTag("index-posts");
//         revalidateTag("index-posts-search");

//         // 검색어 자동완성 5개 관련 무효화
//         revalidateTag(`${blogId}-search-suggestions`);
//         revalidateTag(`${blogId}-categories-search-suggestions`);
//         revalidateTag("index-search-suggestions");

//         // 무한 스크롤 무효화
//         revalidateTag("infinite-scroll-posts");

//         // 게시글 페이지네이션 무효화 (카테고리 x)
//         revalidateTag("posts-pagination");

//         // 사용자 카테고리 무효화, 카테고리 관리 페이지에서 특정 카테고리에 게시글 개수 맞춰야하기 때문에 사용
//         revalidateTag(`${blogId}-categories`);

//         // 사용자 카테고리 페이지 무효화
//         revalidateTag("posts-categories");

//         // 카테고리 게시글 페이지네이션 무효화
//         revalidateTag("posts-categories-pagination");

//     } catch (error) {
//         console.error("revalidateAllRelatedCaches 캐시 무효화 실패:", error);
//     }
// }
