import { refreshToken } from "@/app/posts/(common)/utils/refreshToken";

import { useMutation } from "react-query";

import type { PostRequest } from "@/common/types/PostTypes";
import { useEffect, useState } from "react";

function useAddPost() {
    
    const [accessToken, setAccessToken] = useState<string | false>(false);

    // localStorage는 서버사이드 렌더링에서 오류가 나기 때문에 useEffect를 사용해 클라이언트에서만 사용하도록 한다.
    // useEffect로 감싸면 useEffect 코드는 서버사이드 렌더링에서 실행되지 않고, 컴포넌트 마운트 후 "클라이언트 사이드에서만" useEffect를 실행하게 됨.
    useEffect(() => {
        setAccessToken(localStorage.getItem("access_token") ?? false);
    }, []);

    return useMutation(async (newPost: PostRequest) => {
        console.log("newPost >>>", newPost);

        const createPost: (token: string | boolean) => Promise<Response> = async (token: string | boolean) => {
            return await fetch("http://localhost:8000/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 포함
                },
                body: JSON.stringify(newPost),
            });
        };

        let response = await createPost(accessToken);

        if (!response.ok) {
            if (response.status === 401) {
                const newAccessToken = await refreshToken();
                if (newAccessToken) {
                    response = await createPost(newAccessToken);
                }
            }
        }

        if (!response.ok) {
            throw new Error("Failed to write new post please retry again.");
        }

        return await response.json();
    });
}

export default useAddPost;
