import { extractTextWithoutImages } from "@/utils/extractTextWithoutImages";
import { useQuery } from "@tanstack/react-query";

interface SearchSuggestion {
    id: number;
    title: string;
    blogId: string;
    content?: string;
}

const SEARCH_SUGGESTIONS_KEY = "searchSuggestions";
const ONE_MINUTE = 1000 * 60; // 1000 = ms로 1s
const ONE_HOUR = ONE_MINUTE * 60;

// 아래 로직은 따로 무효화 안해도, 브라우저 뒤로가기 앞으로가기만으로도 캐시가 무효화 됨(router.push, replace도 당연히 무효화). 이유는 못찾았음..
export const useSearchSuggestions = (
    blogId: string | undefined,
    keyword: string,
    searchType: string,
    categoryName: string | undefined,
    categoryNameByQueryParams: string | null
) => {
    return useQuery({
        queryKey: [SEARCH_SUGGESTIONS_KEY, blogId, keyword, searchType, categoryName, categoryNameByQueryParams],
        queryFn: async () => {
            if (!keyword.trim()) return [];

            console.log("쿼리 실행");

            let res;

            if (blogId) {
                if (categoryName || categoryNameByQueryParams) {
                    res = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?category=${
                            categoryName || categoryNameByQueryParams
                        }&keyword=${keyword}&searchType=${searchType}&size=5`
                    );
                } else {
                    res = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?keyword=${keyword}&searchType=${searchType}&size=5`
                    );
                }
            } else {
                res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?keyword=${keyword}&searchType=${searchType}&size=5`
                );
            }

            if (!res.ok) throw new Error("자동 완성 검색어를 불러오는데 실패했습니다.");

            const response = await res.json();

            return response.data.content.map(
                (item: any): SearchSuggestion => ({
                    id: item.id,
                    title: item.title,
                    blogId: item.blogId,
                    content: searchType !== "TITLE" ? extractTextWithoutImages(item.content).substring(0, 15) + "..." : undefined,
                })
            );
        },
        enabled: keyword.length > 0,
        staleTime: ONE_MINUTE * 30, // 30분
        gcTime: ONE_HOUR, // 1시간
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
    });
};
