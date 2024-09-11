import { QueryClient, useQuery, useQueryClient } from "react-query";

const checkAccessTokenFn = async (queryClient: QueryClient) => {
    console.log("실행행34343433");
    const accessToken = localStorage.getItem("access_token");

    const response = await fetch(
        "http://localhost:8000/api/token/check-access-token",
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
        }
    );

    // 액세스 토큰이 유효하지 않을때 서버측 에러. 즉, isLoggedIn false
    if (!response.ok) {
        queryClient.setQueryData("isLoggedIn", false);
        return false;
    }

    // 액세스 토큰이 유효하면 isLoggedIn true 처리
    queryClient.setQueryData("isLoggedIn", true);
    return true;
};

function useCheckAccessToken() {
    const queryClient = useQueryClient();

    const {
        data: isLoggedIn,
        isError,
        isLoading,
    } = useQuery(
        ["isLoggedIn"],
        () => checkAccessTokenFn(queryClient), // queryFn으로 checkAccessTokenFn 사용
        {
            retry: false, // 서버 요청 실패 시 재시도하지 않음
            onError: () => {
                queryClient.setQueryData("isLoggedIn", false);
            },
        }
    );

    return { isLoggedIn, isLoading, isError }; // 결과 값을 반환
}

export default useCheckAccessToken;
