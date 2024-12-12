// import {
//     QueryFunctionContext,
// } from "react-query";

import { OAuth2UserAdditionalInfo, SignupUser } from "@/types/SignupUserTypes";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { refreshToken } from "@/utils/refreshToken";

// export const fetchPosts = async () => {

//     console.log("데이터 가져오는 리액트 쿼리 실행");

//     const response = await fetch("http://localhost:8000/api/posts", {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         },
//     });

//     if (!response.ok) {
//         throw new Error("Failed to fetch posts");
//     }

//     return await response.json();
// };

// export const fetchPost = async ({ queryKey }: QueryFunctionContext) => {
//     const [, id] = queryKey;

//     const response = await fetch(`http://localhost:8000/api/posts/${id}`, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json"
//         }
//     });

//     if (!response.ok) {
//         throw new Error(`Failed to fetch post with id ${id}`);
//     }

//     const data = await response.json();
//     return data;
// };

export const fetchAccessToken = async () => {
    // 초기 로그인 시 브라우저 쿠키에 담긴 액세스 토큰을 서버에서 검증한 후, 다시 클라이언트측으로 응답 헤더를 통해 액세스 토큰 전송
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/token/initial-token`, {
        method: "GET",
        credentials: "include",
    });

    // 액세스 토큰을 브라우저 (HTTP ONLY)쿠키에서 찾을 수 없을때 서버측에서 오류 발생
    if (!response.ok) {
        return false;
    }

    const responseAccessToken = response.headers.get("Authorization")?.split(" ")[1];

    if (!responseAccessToken) {
        return false;
    }

    localStorage.setItem("access_token", responseAccessToken);
    return true;
};

export const checkAccessToken = async () => {
    console.log("checkAccessToken 안쪽 실행");

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
        return null;
    }

    try {
        if (accessToken) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/token/check-access-token`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // 액세스 토큰이 유효하지 않을때 서버측 에러. 즉, isLoggedIn false
            if (!response.ok) {
                return false;
            }

            return true;
        }
    } catch (error) {
        console.log("토큰 유효성 검사 실패", error);
        return false;
    }
};

// if (response.status === 401) {
//     try {
//         const newAccessToken = await refreshToken();
//         if (newAccessToken) {
//             response = await deletePost(postId, newAccessToken, blogId);
//         }
//     } catch (error: unknown) { // 리프레시 토큰 까지 만료되면 재로그인 필요
//         if (error instanceof CustomHttpError) {
//             setAccessToken(null);
//             throw new CustomHttpError(error.status, error.message);
//         }
//     }
// }

export const fetchIsAuthor = async (postId: string, blogId: string, accessToken: string | null) => {
    const verifyPostAuthor = async (accessToken: string | null) => {
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${postId}/verify-author`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
    };

    const response = await verifyPostAuthor(accessToken);

    if (!response.ok && response.status === 500) {
        throw new CustomHttpError(response.status, "작성자 확인에 실패했습니다. 잠시후 다시 시도해주세요.");
    }

    const data = await response.json();
    return data.isAuthor; // 서버에서 isAuthor 값을 반환받아 true or false값을 반환
};

export const fetchCategories = async (blogId: string) => {
    const accessToken = localStorage.getItem("access_token") ?? false;

    const getAllCategories: (token: string | boolean) => Promise<Response> = async (token: string | boolean) => {
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
    };

    let response = await getAllCategories(accessToken);

    if (!response.ok) {
        if (response.status === 401) {
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                response = await getAllCategories(newAccessToken);
            }
        }
    }

    if (!response.ok) {
        throw new Error("Failed to categories please retry again.");
    }

    return await response.json();
};

export const checkAvailabilityRequest = {
    blogId: async (value: string): Promise<{ status: number; isExist: boolean; message: string }> => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/check/blog-id/duplicate/${value}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const responseData = await response.json();

        if (response.status === 429 || response.status === 409) {
            throw new CustomHttpError(response.status, responseData.message);
        }

        return {
            status: response.status,
            isExist: responseData.data,
            message: responseData.message,
        };
    },

    email: async (value: string): Promise<{ status: number; isExist: boolean; message: string }> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/check/email/duplicate/${value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const responseData = await response.json();

        if (response.status === 429 || response.status === 409) {
            throw new CustomHttpError(response.status, responseData.message);
        }

        return {
            status: response.status,
            isExist: responseData.data,
            message: responseData.message,
        };
    },

    username: async (value: string): Promise<{ status: number; isExist: boolean; message: string }> => {
        console.log("실행 userName 부분");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/check/username/duplicate/${value}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const responseData = await response.json();

        console.log("responseDatauserName 부분", responseData);

        if (response.status === 429 || response.status === 409) {
            throw new CustomHttpError(response.status, responseData.message);
        }

        return {
            status: response.status,
            isExist: responseData.data,
            message: responseData.message,
        };
    },
};

export const signupUser = async (newUser: SignupUser) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
    });

    const responseData = await response.json(); // 성공시 JSON 응답 반환

    if (!response.ok) {
        throw new CustomHttpError(response.status, responseData.message);
    }

    return {
        status: response.status,
        message: responseData.message,
        signupUser: responseData.data,
    };
};

export const signupOAuth2User = async (additionalInfo: OAuth2UserAdditionalInfo, tempOAuth2UserUniqueId: string) => {
    const requestData = {
        ...additionalInfo,
        tempOAuth2UserUniqueId,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/oauth2/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // 응답으로 쿠키를 받으려면 필수
        body: JSON.stringify(requestData),
    });

    const accessToken = response.headers.get("Authorization")?.split(" ")[1];

    if (accessToken) {
        localStorage.setItem("access_token", accessToken);
    }

    const responseData = await response.json(); // 성공시 JSON 응답 반환

    if (!response.ok) {
        throw new CustomHttpError(response.status, responseData.message);
    }

    return {
        status: response.status,
        message: responseData.message,
        signupUser: responseData.data,
    };
};

export const verifyEmailCode = async (email: string, code: string) => {
    const verify = {
        email,
        code,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/verify-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(verify),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new CustomHttpError(response.status, responseData.message);
    }

    return {
        status: response.status,
        message: responseData.message,
        userData: responseData.data,
    };
};

export const loginUser = async (loginData: { email: string; password: string; rememberMe: boolean }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 저장을 위해 사용
        body: JSON.stringify(loginData),
    });

    const accessToken = response.headers.get("Authorization")?.split(" ")[1];

    if (accessToken) {
        localStorage.setItem("access_token", accessToken);
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new CustomHttpError(response.status, errorData.message);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json(); // JSON 응답 반환
    } else {
        return await response.text(); // 문자열 응답 반환
    }
};

export const logoutUser = async () => {
    try {
        const accessToken = localStorage.getItem("access_token");

        if (accessToken === null) {
            return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // 쿠키 삭제를 위해 사용
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Fail to logout Please try again.");
        }

        // 로그아웃 성공시 로컬스토리지에서 토큰 제거
        localStorage.removeItem("access_token");

        // 로그아웃의 경우 서버측에서 보통 응답 본문 없이 httpstatus만 넘겨주기 때문에 응답 본문이 없거나 JSON이 아닐 수 있으므로 안전하게 처리 한다.
        // 내 경우 메시지 까지 같이 전해서 주긴 했음. 즉, 응답 본문이 있기 때문에 catch로 넘어가진 않음.
        try {
            return await response.text();
        } catch (error) {
            // 응답 본문이 없는 경우 빈 객체 반환. 응답 본문이 없기 때문에 await response.json()에서 에러가 난다. 즉, 응답헤더만 있을 경우. 대부분 로그아웃의 경우 catch문의 빈 객체를 최종적으로 리턴.
            return {};
        }
    } catch (error) {
        console.error("로그아웃 실패:", error);
        throw error; // 상위 함수로 에러 전달
    }
};
