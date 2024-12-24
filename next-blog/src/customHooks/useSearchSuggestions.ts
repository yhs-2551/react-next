import { extractTextWithoutImages } from "@/utils/extractTextWithoutImages";
import { useQuery } from "react-query";

interface SearchSuggestion {
    id: number;
    title: string;
    content?: string;
}

export const SEARCH_SUGGESTIONS_KEY = "searchSuggestions";

export const useSearchSuggestions = (blogId: string, keyword: string, searchType: string) => {
    return useQuery({
        queryKey: [SEARCH_SUGGESTIONS_KEY, blogId, keyword, searchType],
        queryFn: async () => {
            if (!keyword) return [];

            console.log("queryFn실행 실행 >>>>>>>>>>>> ", blogId, keyword, searchType);

            // const suggestions = response.data.content.map((item: any) => ({
            //                     id: item.id,
            //                     title: item.title,
            //                     content: searchType !== "TITLE" ? extractTextWithoutImages(item.content).substring(0, 15) + "..." : undefined,
            //                 }));

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts?keyword=${keyword}&searchType=${searchType}&size=5`
            );

            if (!res.ok) throw new Error("자동 완성 검색어를 불러오는데 실패했습니다.");

            const response = await res.json();

            console.log("res:", response);

            return response.data.content.map(
                (item: any): SearchSuggestion => ({
                    id: item.id,
                    title: item.title,
                    content: searchType !== "TITLE" ? extractTextWithoutImages(item.content).substring(0, 15) + "..." : undefined,
                })
            );
        },
        enabled: Boolean(keyword),
        staleTime: Infinity,
        cacheTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
    });
};

// 위의 쿼리키와 달라도 [A, B]로 무효화하면 [A, B, ...]로 시작하는 모든 쿼리 무효화.
// 블로그 글이 변경되면(생성, 수정, 삭제) 모든 검색 결과 캐시를 무효화해야 함
export const invalidateSearchSuggestions = (queryClient: any, blogId: string) => {
    queryClient.invalidateQueries({
        queryKey: [SEARCH_SUGGESTIONS_KEY, blogId],
    });
};
 