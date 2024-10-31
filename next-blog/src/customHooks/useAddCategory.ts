import { refreshToken } from "@/app/posts/(common)/utils/refreshToken";

import { useMutation } from "react-query";

import { CategoryType } from "@/app/manage/category/types/category";

function useAddCategory() {
    // const queryClient = useQueryClient();
    const accessToken = localStorage.getItem("access_token") ?? false;

    return useMutation(
        async (category: CategoryType[]) => {
            console.log("category >>>", category);

            const createCategory: (token: string | boolean) => Promise<Response> = async (token: string | boolean) => {
                return await fetch("http://localhost:8000/api/categories", {
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

            return await response.json();
        }
    );
}

export default useAddCategory;
