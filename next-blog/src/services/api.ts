import axios from "axios";
import { QueryClient, QueryFunctionContext } from "react-query";

export const fetchPosts = async () => {
    const { data } = await axios.get("http://localhost:8000/api/posts");
    return data;
};

export const fetchPost = async ({ queryKey }: QueryFunctionContext) => {
    const [, id] = queryKey;
    const { data } = await axios.get(`http://localhost:8000/api/posts/${id}`);
    return data;
};

export const fetchAccessToken = async (queryClient: QueryClient) => {
    console.log("FetchAccesstToken 실행");

    // 초기 로그인 시 브라우저 쿠키에 담긴 액세스 토큰을 서버에서 검증한 후, 다시 클라이언트측으로 응답 헤더를 통해 액세스 토큰 전송
    const response = await fetch(
        "http://localhost:8000/api/token/initial-token",
        {
            method: "GET",
            credentials: "include",
        }
    );

    console.log("useFetchAccessTOekn", response);

    // 액세스 토큰을 브라우저 (HTTP ONLY)쿠키에서 찾을 수 없을때 서버측에서 오류 발생
    if (!response.ok) {
        console.log("실패 시행");
        // queryClient.setQueryData("isLoggedIn", false);
        return false;
    }

    const responseAccessToken = response.headers
        .get("Authorization")
        ?.split(" ")[1];
    console.log("액세스 토큰", responseAccessToken);

    if (responseAccessToken) {
        console.log("성공 시행");
        localStorage.setItem("access_token", responseAccessToken);
        // queryClient.setQueryData("isLoggedIn", true); // 로그인 상태 업데이트
        return true;
    }

    const localStorageAccessToken = localStorage.getItem("access_token");

    if (!localStorageAccessToken) {
        // queryClient.setQueryData("isLoggedIn", false);
        return false;
    }
};

export const checkAccessToken = async (queryClient: QueryClient) => {
    console.log("실행행34343433");
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
        const response = await fetch(
            "http://localhost:8000/api/token/check-access-token",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        );

        console.log("useFetchCheckAccessToken", response);

        // 액세스 토큰이 유효하지 않을때 서버측 에러. 즉, isLoggedIn false
        if (!response.ok) {
            // queryClient.setQueryData("isLoggedIn", false);
            return false;
        }

        // 액세스 토큰이 유효하면 isLoggedIn true 처리
        // queryClient.setQueryData("isLoggedIn", true);
        return true;

    } else {
        console.log("Failed to retrieve the access token from local storage.");
        // queryClient.setQueryData("isLoggedIn", false);
        return false;
    }
};
