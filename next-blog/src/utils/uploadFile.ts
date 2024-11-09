import { refreshToken } from "./refreshToken";

export const uploadFile = async (file: File, featured?: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    if (featured) {
        formData.append("featured", featured);
    }

    const upload = async (token: string | boolean) => {
        return await fetch("http://localhost:8000/api/posts/temp/files/upload", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });
    };

    const accessToken: string | false = localStorage.getItem("access_token") ?? false;
    let response = await upload(accessToken);

    // 토큰이 유효하지 않다면, 리프레시 토큰을 통해 토큰 재발급
    if (!response.ok && response.status === 401) {
        // 만약 리프레시 토큰이 만료되었을 경우 만료된 액세스 토큰 사용해서 액세스 토큰 재발급
        // 리프레시 토큰이 만료되지 않았다면 리프레시 토큰으로 액세스 토큰 재발급
        const newAccessToken = await refreshToken();

        if (newAccessToken) {
            response = await upload(newAccessToken);
        }
    }

    if (!response.ok) {
        throw new Error("Failed to upload file, please retry again.");
    }

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    const fileUrl = typeof data === "string" ? data : data.url;

    return fileUrl;
};
