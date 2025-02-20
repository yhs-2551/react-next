"use server";

import { cookies } from "next/headers";

// import { CacheTimes } from "@/constants/cache-constants";
interface SearchSuggestionProps {
    id: number;
    title: string;
    blogId: string;
    content?: string;
}

export async function getSearchSuggestions(
    blogId: string | undefined,
    keyword: string,
    searchType: string,
    categoryName: string | undefined,
    categoryNameByQueryParams: string | null
) {
    if (!keyword.trim() || keyword.length === 0) return [];

    // 리프레시 토큰을 요청시에 같이 보낼 수 있도록 함. 공개/비공개 글 구분해서 조회하기 위해
    const cookieStore = await cookies();

    let res;

    if (blogId) {
        if (categoryName || categoryNameByQueryParams) {
            res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?category=${
                    categoryName || categoryNameByQueryParams
                }&keyword=${keyword}&searchType=${searchType}&size=5`,
                {
                    cache: "no-cache",
                    // next: {
                    //     tags: [`${blogId}-categories-search-suggestions`],
                    //     revalidate: CacheTimes.MODERATE.POSTS_CATEGORY_SEARCH_SUGGESTIONS,
                    // },
                    headers: {
                        Cookie: cookieStore.toString(),
                    },
                }
            );
        } else {
            res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?keyword=${keyword}&searchType=${searchType}&size=5`,
                {
                    cache: "no-cache",
                    // next: {
                    //     tags: [`${blogId}-search-suggestions`],
                    //     revalidate: CacheTimes.MODERATE.POSTS_SEARCH_SUGGESTIONS,
                    // },
                    headers: {
                        Cookie: cookieStore.toString()
                    }
                }
            );
        }
    } else {
        res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?keyword=${keyword}&searchType=${searchType}&size=5`,
            {
                cache: "no-cache",
                // next: {
                //     tags: ["index-search-suggestions"],
                //     revalidate: CacheTimes.FREQUENT.INDEX_SEARCH_SUGGESTIONS,
                // },
                headers: {
                    Cookie: cookieStore.toString()
                }
            }
        );
    }

    if (!res.ok) throw new Error("자동 완성 검색어를 불러오는데 실패했습니다.");

    const response = await res.json();

    console.log("response >>>>", response.data.content);

    return response.data.content.map(
        (item: any): SearchSuggestionProps => ({
            id: item.id,
            title: item.title,
            blogId: item.blogId,
            content: searchType !== "TITLE" ? item.content : "",
        })
    );
}
