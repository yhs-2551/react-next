// 로그인 안된 사용자 확인 또는 로그인 후 리다이렉트 시 초기에 쿠키에 있는 액세스 토큰을 서버로 요청 해 다시 응답 헤더로 받아와 로컬 스토리지에 저장하는 커스텀 훅

import { QueryClient, useQuery, useQueryClient } from "react-query";

const fetchAccessToken = async (queryClient: QueryClient) => {
    console.log("실행행33");
    // 초기 로그인 시 브라우저 쿠키에 담긴 액세스 토큰을 서버에서 검증한 후, 다시 클라이언트측으로 응답 헤더를 통해 액세스 토큰 전송
    const response = await fetch(
        "http://localhost:8000/api/token/initial-token",
        {
            method: "GET",
            credentials: "include",
        }
    );

    console.log("실3424행행33");

    // 액세스 토큰을 브라우저 (HTTP ONLY)쿠키에서 찾을 수 없을때 서버측에서 오류 발생
    if (!response.ok) {
        console.log("실패 시행");
        queryClient.setQueriesData("isLoggedIn", false);
        return false;
    }

    const accessToken = response.headers.get("Authorization")?.split(" ")[1];
    if (accessToken) {
        console.log("성공 시행");
        localStorage.setItem("access_token", accessToken);
        queryClient.setQueryData("isLoggedIn", true); // 로그인 상태 업데이트
        return true;
    }

    return false;
};

export const useFetchAccessToken = () => {
    const queryClient = useQueryClient();

    return useQuery(
        ["isLoggedIn"], // Query key
        () => fetchAccessToken(queryClient), // Query function (queryFn)
        {
            retry: false, // 요청 실패 시 재시도 하지 않음
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
            onError: () => {
                queryClient.setQueryData("isLoggedIn", false);
            },
        }
    );

};

export default useFetchAccessToken;
