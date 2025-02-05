// 클라이언트 컴포넌트에서 호출하는 서버액션은 캐시 무효화시 바로 서버측으로 요청을 보내는게 아닌, 해당 캐시를 무효화만 한다. 실제 서버에 요청은 다음 요청때 이루어진다.(태그 기반 캐시 무효화 기준)
// 반면 서버 컴포넌트에서 바로 서버측으로 보내는 요청의 경우 캐시 무효화시 캐시 무효화 이후 해당 서버컴포넌트가 재실행되면서 실제로 서버측으로 바로 요청이 보내지게 된다.
"use server";

import { CacheTimes } from "@/constants/cache-constants";

export async function fetchCategoriesWithToken(blogId: string, accessToken: string): Promise<any> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories`, {
        cache: "force-cache",
        next: { tags: [`${blogId}-categories`], revalidate: CacheTimes.MODERATE.PUBLIC_USER_CATEGORY },
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error("카테고리 데이터를 불러오는데 실패하였습니다.");
    }

    return res.json();
}
export async function fetchCategoriesNotToken(blogId: string): Promise<any> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories`, {
        cache: "no-cache",
        next: { tags: [`${blogId}-categories`], revalidate: CacheTimes.MODERATE.PUBLIC_USER_CATEGORY },
    });

    if (!res.ok) {
        throw new Error("카테고리 데이터를 불러오는데 실패하였습니다.");
    }

    return res.json();
}
