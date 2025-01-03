import { CustomHttpError } from "./CustomHttpError";

export const refreshToken: () => Promise<string | null> = async (): Promise<string | null> => {
    const newTokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/token/new-token`, {
        method: "GET",
        credentials: "include", // 쿠키를 포함하여 요청
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (newTokenResponse.ok) {
        const responseAccessToken = newTokenResponse.headers.get("Authorization")?.split(" ")[1];
        if (responseAccessToken) {
            localStorage.setItem("access_token", responseAccessToken);
            return responseAccessToken;
        }
    } else {
        
        const errorData = await newTokenResponse.json();

        throw new CustomHttpError(newTokenResponse.status, errorData.message); // 리프레시 토큰도 만료될 시 재로그인이 필요합니다. 메시지 응답 받음.
    }

    return null;
};
