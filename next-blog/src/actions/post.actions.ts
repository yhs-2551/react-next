"use server";

import { CacheTimes } from "@/constants/cache-constants";

// import { CacheTimes } from "@/constants/cache-constants";

async function editPageResponse(res: Response, postId: string, functionName: string) {
    if (!res.ok && res.status === 404) {
        console.error(`${functionName} 특정 사용자 수정 페이지 ${postId} 404 에러 실행`);
        return { success: false, status: 404, message: `수정 페이지 ${postId} 게시글을 찾을 수 없습니다.` };
    } else if (!res.ok) {
        //  실제 처리는 클라이언트 컴포넌트에서 상태를 이용해서 에러 처리를 해야 error.tsx로 전달됨

        console.error(`${functionName} 특정 사용자 수정 페이지 게시글 데이터를 불러오는데 실패`);
        return { success: false, status: 500, message: "특정 사용자 상세 페이지 게시글 데이터를 불러오는데 실패하였습니다." };
    }

    return await res.json(); // json() 메서드 await 필요
}

async function userPostListsAndSearchSuggestionsPageResponse(res: Response, functionName: string) {
    if (!res.ok && res.status === 401) {
        console.error(`${functionName}  액세스 토큰 만료 실행`);
        return { success: false, status: 401, message: "액세스 토큰이 만료 되었습니다." };
    }

    if (!res.ok) {
        console.error(`${functionName} 서버측 오류로 데이터를 불러오는데 실패`);
        return { success: false, status: 500, message: `${functionName} 데이터를 불러오는데 실패하였습니다.` };
    }
    return await res.json();
}

async function baseResponse(res: Response, functionName: string, postId?: string) {
    if (!res.ok && res.status === 401) {
        console.error(`${functionName}  액세스 토큰 만료 실행`);
        return { success: false, status: 401, message: "액세스 토큰이 만료 되었습니다." };
    } else if (!res.ok && res.status === 404) {
        //  redirect("/404"); notfound()는 작동이 안함 try/catch로 감싸고 있는 유무와 상관 없이

        if (postId) {
            console.error(`${functionName} ${postId} 404 에러 실행`);
            return { success: false, status: 404, message: `${functionName} ${postId} 게시글을 찾을 수 없습니다.` };
        } else {
            console.error(`${functionName} 404 에러 실행`);
            return { success: false, status: 404, message: `${functionName} 데이터를 찾을 수 없습니다.` };
        }
    } else if (!res.ok) {
        console.error(`${functionName} 서버측 오류로 데이터를 불러오는데 실패`);
        return { success: false, status: 500, message: `${functionName} 데이터를 불러오는데 실패하였습니다.` };
    }
    return await res.json();
}

export async function getInfiniteScrollPosts(page: number = 3, size: number = 10) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?page=${page}&size=${size}`, {
        cache: "no-cache",
        // next: {
        //     tags: ["infinite-scroll-posts"],
        //     revalidate: CacheTimes.FREQUENT.INDEX_INFINITE_SCROLL_POSTS,
        // },
    });

    if (!response.ok) {
        throw new Error("무한 스크롤 포스트 데이터를 불러오는데 실패 하였습니다.");
    }

    return await response.json();
}

export async function fetchSpecificUserPosts(blogId: string, token: string | null) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?page=0&size=8`, {
        cache: "force-cache",
        next: {
            tags: [`${blogId}-posts`],
            revalidate: CacheTimes.MODERATE.POSTS,
        },
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    //  await res.json();을 리턴하는 비동기 함수를 사용하기 위해선 아래처럼 다시 await 해주어야함
    // 이유는 비동기 함수는 무조건 Promise를 리턴하기 때문에 자바스크립트 객체로서 사용하기 위해서 await 추가 해주어야 함
    return await userPostListsAndSearchSuggestionsPageResponse(res, "fetchSpecificUserPosts");
}

export async function fetchSpecificUserPaginationPosts(blogId: string, pageNum: string, token: string | null) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/page/${pageNum}?size=8`, {
        cache: "no-cache",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        // next: { tags: ["posts-pagination"], revalidate: CacheTimes.MODERATE.POSTS_PAGINATION },
    });

    return await baseResponse(res, "fetchSpecificUserPaginationPosts");
}

// 사용자 카테고리 페이지 관련
export async function fetchSpecificUserCategoryPosts(blogId: string, categoryName: string, token: string | null) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories/${categoryName}/posts?size=8`,
        {
            cache: "no-cache",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            // next: {
            //     tags: ["posts-categories"],
            //     revalidate: CacheTimes.MODERATE.POSTS_CATEGORY,
            // },
        }
    );

    return await baseResponse(res, "fetchSpecificUserCategoryPosts");
}

// 사용자 카테고리 페이지네이션 관련
export async function fetchSpecificUserCategoryPaginationPosts(blogId: string, categoryName: string, pageNum: string, token: string | null) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories/${categoryName}/posts/page/${pageNum}?size=8`,
        {
            cache: "no-cache",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            // next: { tags: ["posts-categories-pagination"], revalidate: CacheTimes.MODERATE.POSTS_CATEGORY_PAGINATION },
        }
    );

    return await baseResponse(res, "fetchSpecificUserCategoryPaginationPosts");
}

export async function fetchPostDetail(blogId: string, postId: string, token: string | null) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${postId}`, {
        cache: "no-cache",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        // next: {
        //     tags: [`${blogId}-post-${id}-detail`],
        //     revalidate: CacheTimes.MODERATE.POST_DETAIL
        // }
    });

    return await baseResponse(res, "fetchPostDetail", postId);
}

// 수정 페이지는 AuthCheck에서 이미 블로그 주인 검증 및 리프레시 토큰을 이용한 액세스 토큰 재발급까지 끝냈기 때문에 해당 사용자만 요청할 수 있음. 따라서 401처리 필요 없고, 액세스 토큰이 무조건 존재
// 클리이언트 컴포넌트에서 서버 액션 실행
export async function fetchPostEditDetail(blogId: string, postId: string, token: string | null) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${postId}/edit`, {
        cache: "no-cache",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        // next: {
        //     tags: [`${blogId}-post-${id}-edit`],
        //     revalidate: CacheTimes.MODERATE.POST_EDIT,
        // },
    });

    return await editPageResponse(res, postId, "fetchPostEditDetail");
}

// 사용자 페이지 검색 결과
export async function searchPostsForUserPage(blogId: string, queryParams: string, token: string | null) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?${queryParams}&size=8&`,
        {
            cache: "no-cache",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        }
    );

    return await baseResponse(response, "searchPostsForUserPage");
}

// 검색어 자동 완성
// import { CacheTimes } from "@/constants/cache-constants";
interface SearchSuggestionProps {
    id: number;
    title: string;
    blogId: string;
    content?: string;
}

export async function getSearchSuggestions(
    blogId: string | undefined,
    token: string | null,
    keyword: string,
    searchType: string,
    categoryName: string | undefined,
    categoryNameByQueryParams: string | null
) {
    if (!keyword.trim() || keyword.length === 0) return [];

    let res;

    if (blogId) {
        if (categoryName || categoryNameByQueryParams) {
            res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?category=${
                    categoryName || categoryNameByQueryParams
                }&keyword=${keyword}&searchType=${searchType}&size=5`,
                {
                    cache: "no-cache",
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    // next: {
                    //     tags: [`${blogId}-categories-search-suggestions`],
                    //     revalidate: CacheTimes.MODERATE.POSTS_CATEGORY_SEARCH_SUGGESTIONS,
                    // },
                }
            );
        } else {
            res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?keyword=${keyword}&searchType=${searchType}&size=5`,
                {
                    cache: "no-cache",
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    // next: {
                    //     tags: [`${blogId}-search-suggestions`],
                    //     revalidate: CacheTimes.MODERATE.POSTS_SEARCH_SUGGESTIONS,
                    // },
                }
            );
        }
    } else {
        res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?keyword=${keyword}&searchType=${searchType}&size=5`,
            {
                cache: "no-cache",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                // next: {
                //     tags: ["index-search-suggestions"],
                //     revalidate: CacheTimes.FREQUENT.INDEX_SEARCH_SUGGESTIONS,
                // },
            }
        );
    }

    //userPostListsAndSearchSuggestionsPageResponse는 비동기 함수이기 때문에 무조건 await 필요. await 사용하지 않으면 promise 객체가 리턴됨
    const response = await userPostListsAndSearchSuggestionsPageResponse(res, "getSearchSuggestions");

    return response.data.content.map(
        (item: any): SearchSuggestionProps => ({
            id: item.id,
            title: item.title,
            blogId: item.blogId,
            content: searchType !== "TITLE" ? item.content : "",
        })
    );
}
