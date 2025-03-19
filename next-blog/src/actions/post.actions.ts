"use server";

import { CacheTimes } from "@/constants/cache-constants"; 

// import { CacheTimes } from "@/constants/cache-constants";

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

    return response.json();
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

    if (!res.ok && res.status === 401) {
        console.error("fetchSpecificUserPosts 액세스 토큰 만료 분기 실행");
        throw new Error("액세스 토큰 만료");
    }

    if (!res.ok) {
        console.error("fetchSpecificUserPosts 서버측 오류로 인해 특정 사용자 게시글 목록 조회 실패");
        throw new Error("서버측 오류로 인해 특정 사용자 게시글 목록 데이터를 불러오는데 실패하였습니다.");
    }
    return res.json();
}

export async function fetchSpecificUserPaginationPosts(blogId: string, pageNum: string, token: string | null) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/page/${pageNum}?size=8`, {
        cache: "no-cache",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        // next: { tags: ["posts-pagination"], revalidate: CacheTimes.MODERATE.POSTS_PAGINATION },
    });

    if (!res.ok && res.status === 401) {
        console.error("fetchSpecificUserPaginationPosts 액세스 토큰 만료 실행");
        throw new Error("액세스 토큰 만료");
    } else if (!res.ok && res.status === 404) {
        console.error("fetchSpecificUserPaginationPosts 404에러 실행");
        throw new Error("특정 사용자 페이지네이션 목록 데이터가 없습니다.");
    } else if (!res.ok) {
        console.error("fetchSpecificUserPaginationPosts 특정 사용자 페이지네이션 목록 데이터 조회 실패 실행");
        throw new Error("특정 사용자 페이지네이션 목록 데이터를 불러오는데 실패하였습니다.");
    }

    return await res.json();
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

    if (!res.ok && res.status === 401) {
        console.error("fetchSpecificUserCategoryPosts 액세스 토큰 만료 실행");
        throw new Error("액세스 토큰 만료");
    } else if (!res.ok && res.status === 404) {
        console.error("fetchSpecificUserCategoryPosts 404에러 실행");
        throw new Error("특정 사용자의 카테고리 목록 데이터가 없습니다.");
    } else if (!res.ok) {
        console.error("fetchSpecificUserCategoryPosts 특정 사용자의 카테고리 목록 데이터 조회 실패 실행");
        throw new Error("특정 사용자의 카테고리 목록 데이터를 불러오는데 실패하였습니다.");
    }

    return await res.json();
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

    if (!res.ok && res.status === 401) {
        console.error("fetchSpecificUserCategoryPaginationPosts 액세스 토큰 만료 실행");
        throw new Error("액세스 토큰 만료");
    } else if (!res.ok && res.status === 404) {
        console.error("fetchSpecificUserCategoryPaginationPosts 404에러 실행");
        throw new Error("특정 사용자의 카테고리 페이지네이션 목록 데이터가 없습니다.");
    } else if (!res.ok) {
        console.error("fetchSpecificUserCategoryPaginationPosts 특정 사용자의 카테고리 페이지네이션 데이터 조회 실패 실행");
        throw new Error("특정 사용자의 카테고리 페이지네이션 데이터를 불러오는데 실패하였습니다.");
    }

    return await res.json();
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

    if (!res.ok && res.status === 401) {
        console.error("fetchPostDetail  액세스 토큰 만료 실행");
        throw new Error("액세스 토큰 만료");
    } else if (!res.ok && res.status === 404) {
        console.error(`fetchPostDetail ${postId} 404 에러 실행`);
        throw new Error(`상세 페이지 ${postId} 게시글을 찾을 수 없습니다.`);
        // return { success: false, error: "POST_NOT_FOUND", message: `상세 페이지 ${postId} 게시글을 찾을 수 없습니다.` };
       //  redirect("/404"); notfound()는 작동이 안함 try/catch로 감싸고 있는 유무와 상관 없이
    } else if (!res.ok) {
        console.error("fetchPostDetail 서버측 오류로 특정 사용자 상세 페이지 게시글 데이터를 불러오는데 실패");
        throw new Error("특정 사용자 상세 페이지 게시글 데이터를 불러오는데 실패하였습니다.");
    }
    return res.json();
}

// 수정 페이지는 AuthCheck에서 이미 블로그 주인 검증 및 리프레시 토큰을 이용한 액세스 토큰 재발급까지 끝냈기 때문에 해당 사용자만 요청할 수 있음. 따라서 액세스 토큰이 무조건 존재
// 또한 얘를 실행하는 클라이언트 컴포넌트는 클라이언트 컴포넌트에서 임포트해서 실행하기 때문에 클라이언트 환경에서 실행
// 또한 얘는 try catch로 감싸지 않기 때문에 여기서 throw new Error 를 던지면 바로 error.tsx로 전파
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

    if (!res.ok && res.status === 404) {
        console.error(`fetchPostEditDetail 특정 사용자 수정 페이지 ${postId} 404 에러 실행`);
        throw new Error(`수정 페이지 ${postId} 게시글을 찾을 수 없습니다.`);
    } else if (!res.ok) {
        console.error("fetchPostEditDetail 특정 사용자 수정 페이지 게시글 데이터를 불러오는데 실패");
        throw new Error("서버측 오류로 인해 수정 페이지 데이터를 불러오는데 실패"); // 형식상 여기서 던지고 실제 처리는 클라이언트 컴포넌트에서 상태를 이용해서 에러 처리를 해야 error.tsx로 전달됨
    }

    return res.json();
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

    if (!response.ok && response.status === 401) {
        console.error("searchPostsForUserPage 액세스 토큰 만료 실행");
        throw new Error("액세스 토큰 만료");
    } else if (!response.ok && response.status === 404) {
        console.error("특정 사용자 게시글 searchPostsForUserPage 404에러 실행");
        throw new Error("특정 사용자 게시글 검색 결과가 없습니다.");
    } else if (!response.ok) {
        console.error("searchPostsForUserPage 특정 사용자 게시글 검색 조회 실패 실행");
        throw new Error("특정 사용자 게시글 검색 데이터를 불러오는데 실패하였습니다");
    }

    return response.json();
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

    if (!res.ok && res.status === 401) {
        console.error("getSearchSuggestions메서드 액세스 토큰 만료 실행");
        throw new Error("액세스 토큰 만료");
    } else if (!res.ok) {
        console.error("getSearchSuggestions메서드 검색어 자동완성 실패");
        throw new Error("검색어 자동완성 데이터를 불러오는데 실패하였습니다.");
    }

    const response = await res.json();

    return response.data.content.map(
        (item: any): SearchSuggestionProps => ({
            id: item.id,
            title: item.title,
            blogId: item.blogId,
            content: searchType !== "TITLE" ? item.content : "",
        })
    );
}
