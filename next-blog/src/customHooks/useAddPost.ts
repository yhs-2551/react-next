import { refreshToken } from "@/app/posts/(common)/utils/refreshToken";

import { useMutation } from "react-query";

import type { PostRequest } from "@/common/types/PostTypes";

function useAddPost() {
    // const queryClient = useQueryClient();
    const accessToken = localStorage.getItem("access_token") ?? false;

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
