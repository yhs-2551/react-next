import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { CategoryType } from "@/types/CateogryTypes";
import { refreshToken } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError";

interface CategoryPayload {
    categories: CategoryType[];
    categoryToDelete: CategoryType[] | null;
}

function useAddCategory(blogId: String) {
    // const [accessToken, setAccessToken] = useState<string | false>(false);

    // // localStorage는 서버사이드 렌더링에서 오류가 나기 때문에 useEffect를 사용해 클라이언트에서만 사용하도록 한다.
    // // useEffect로 감싸면 useEffect 코드는 서버사이드 렌더링에서 실행되지 않고, 컴포넌트 마운트 후 "클라이언트 사이드에서만" useEffect를 실행하게 됨.
    // useEffect(() => {
    //     setAccessToken(localStorage.getItem("access_token") ?? false);
    // }, []);

    const accessToken = localStorage.getItem("access_token") ?? false;

    return useMutation({
        mutationFn: async (category: CategoryPayload) => {
            console.log("category >>>", category);

            const createCategory: (token: string | boolean) => Promise<Response> = async (token: string | boolean) => {
                return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories`, {
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
                    
                    try {
                        const newAccessToken = await refreshToken();
                        if (newAccessToken) {
                            response = await createCategory(newAccessToken);
                        }
                    } catch (error: unknown) {
                        
                        if (error instanceof CustomHttpError) {
                            // 리프레시 토큰 까지 만료되어서 재로그인 필요
                            throw new CustomHttpError(error.status, "세션이 만료되었습니다.\n재로그인 해주세요.");
                        }
                    }

                 
                }
            }

            if (!response.ok) {
                throw new CustomHttpError(response.status, "서버측 오류로 인해 카테고리 수정이 실패하였습니다.\n잠시 후 다시 시도해주세요.");
            }

            const responseData = await response.json();

            return responseData.data;
        },
    });
}

export default useAddCategory;
