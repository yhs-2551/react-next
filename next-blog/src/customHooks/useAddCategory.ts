import { useMutation } from "react-query";

import { useEffect, useState } from "react";

import { refreshToken } from "@/utils/refreshToken";
import { CategoryType } from "@/types/CateogryTypes";

interface CategoryPayload {
    categories: CategoryType[];
    categoryToDelete: string[] | null;
}

function useAddCategory(userIdentifier: String) {
    // const [accessToken, setAccessToken] = useState<string | false>(false);

    // // localStorage는 서버사이드 렌더링에서 오류가 나기 때문에 useEffect를 사용해 클라이언트에서만 사용하도록 한다.
    // // useEffect로 감싸면 useEffect 코드는 서버사이드 렌더링에서 실행되지 않고, 컴포넌트 마운트 후 "클라이언트 사이드에서만" useEffect를 실행하게 됨.
    // useEffect(() => {
    //     setAccessToken(localStorage.getItem("access_token") ?? false);
    // }, []);

    const accessToken = localStorage.getItem("access_token") ?? false;

    return useMutation(async (category: CategoryPayload) => {
        console.log("category >>>", category);

        const createCategory: (token: string | boolean) => Promise<Response> = async (token: string | boolean) => {
            return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${userIdentifier}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 포함
                },
                body: JSON.stringify(category),
            });
        };

        let response = await createCategory(accessToken);

        if (!response.ok) {
            if (response.status === 401) {
                const newAccessToken = await refreshToken();
                if (newAccessToken) {
                    response = await createCategory(newAccessToken);
                }
            }
        }

        if (!response.ok) {
            throw new Error("Failed to add new category please retry again.");
        }

        const responseData = await response.json();
        
        return responseData.data;
    });
}

export default useAddCategory;
