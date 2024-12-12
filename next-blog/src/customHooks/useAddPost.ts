import { useMutation } from "react-query";

import { useEffect, useState } from "react";
import { PostRequest } from "@/types/PostTypes";
import { refreshToken } from "@/utils/refreshToken";
import { CustomHttpError } from "@/utils/CustomHttpError";

function useAddPost(blogId: string) {
    // const [accessToken, setAccessToken] = useState<string | false>(false);

    // localStorage는 서버사이드 렌더링에서 오류가 나기 때문에 useEffect를 사용해 클라이언트에서만 사용하도록 한다.
    // useEffect로 감싸면 useEffect 코드는 서버사이드 렌더링에서 실행되지 않고, 컴포넌트 마운트 후 "클라이언트 사이드에서만" useEffect를 실행하게 됨.
    // useEffect(() => {
    //     setAccessToken(localStorage.getItem("access_token") ?? false);
    // }, []);

    const accessToken = localStorage.getItem("access_token") ?? false;

    return useMutation(async (newPost: PostRequest) => {
        const createPost: (token: string | boolean) => Promise<Response> = async (token: string | boolean) => {
            return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json", // Add Accept header
                    Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 포함
                },
                body: JSON.stringify(newPost),
            });
        };

        let response = await createPost(accessToken);

        if (!response.ok) {
            if (response.status === 403) {
                throw new CustomHttpError(response.status, "게시글을 작성할 권한이 없습니다.");
            } else if (response.status === 401) {
                try {
                    const newAccessToken = await refreshToken();
                    if (newAccessToken) {
                        response = await createPost(newAccessToken);
                    }
                } catch (error: unknown) {
                    if (error instanceof CustomHttpError) {
                        // 리프레시 토큰 까지 만료되어서 재로그인 필요
                        throw new CustomHttpError(error.status, "세션이 만료되었습니다. \n로그아웃 이후 재로그인 해주세요.");
                    }
                }
            }
        }

        if (!response.ok && response.status === 500) {
            throw new CustomHttpError(response.status, "서버측 오류로 인해 일시적으로 게시글 수정이 불가능합니다. 잠시 후 다시 시도해주세요.");
        }

        return await response.json();
    });
}

export default useAddPost;
