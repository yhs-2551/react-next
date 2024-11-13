export const refreshToken: () => Promise<string | null> = async (): Promise<string | null> => {
    const accessToken = localStorage.getItem("access_token");

    const newTokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/token/new-token`, {
        method: "POST",
        credentials: "include", // 쿠키를 포함하여 요청
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    if (newTokenResponse.ok) {
        const responseAccessToken = newTokenResponse.headers.get("Authorization")?.split(" ")[1];
        if (responseAccessToken) {
            localStorage.setItem("access_token", responseAccessToken);
            return responseAccessToken;
        }
    }

    return null;
};