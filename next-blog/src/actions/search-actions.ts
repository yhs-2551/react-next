"use server";

interface SearchSuggestionProps {
    id: number;
    title: string;
    blogId: string;
    content?: string;
}

export async function getSearchSuggestions(blogId: string | undefined, keyword: string, searchType: string) {
    if (!keyword.trim() || keyword.length === 0) return [];

    const url = blogId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts`;

    const res = await fetch(`${url}?keyword=${keyword}&searchType=${searchType}&size=5`, {
        cache: "force-cache",
        next: {
            tags: ["search-suggestions"]
        },
    });

    if (!res.ok) throw new Error("자동 완성 검색어를 불러오는데 실패했습니다.");

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
