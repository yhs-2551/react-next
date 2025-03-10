import { OAuth2UserAdditionalInfo, SignupUser } from "@/types/SignupUserTypes";
import { CustomHttpError } from "@/utils/CustomHttpError";

export const fetchAccessToken = async () => {
    // 초기 로그인 시 브라우저 쿠키에 담긴 액세스 토큰을 서버에서 검증한 후, 다시 클라이언트측으로 응답 헤더를 통해 액세스 토큰 전송
    // OAUTH2 로그인 사용자
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
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
        return null;
    }

    if (accessToken === "null" || accessToken === "undefined" || accessToken === "") {
        localStorage.removeItem("access_token");
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
        console.error("checkAccessToken 토큰 유효성 검사 실패", error);
        return false;
    }
};

export const fetchIsAuthor = async (blogId: string, accessToken: string) => {
    const verifyPostAuthor = async (accessToken: string) => {
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/auth/${blogId}/verify-author`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    };

    let res = await verifyPostAuthor(accessToken);

    if (!res.ok && res.status === 401) {
        console.error("fetchIsAuthor 401 에러(액세스 토큰 만료), 액세스 토큰 재발급 작업 시작");

        try {
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                res = await verifyPostAuthor(newAccessToken);
            }
        } catch (error: unknown) {
            if (error instanceof CustomHttpError) {
                console.error("fetchIsAuthor 리프레시 토큰을 통한 액세스 토큰 재발급 401 에러, 재로그인 필요");
                throw new CustomHttpError(error.status, "세션이 만료되었습니다.\n재로그인 해주세요.");
            }
        }
    }

    if (!res.ok && res.status === 500) {
        console.error("fetchIsAuthor 500 서버측 에러");
        throw new CustomHttpError(res.status, "서버측 오류로 인해 작성자 확인이 불가능합니다.");
    }

    const response = await res.json();

    return response.data; // 서버에서 isAuthor 값을 반환받아 true or false값을 반환
};

export const fetchCategories = async (blogId: string) => {
    const getAllCategories: () => Promise<Response> = async () => {
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/categories`, {
            method: "GET",
        });
    };

    const response = await getAllCategories();
    const responseData = await response.json();

    if (!response.ok) {
        console.error("카테고리 가져오기 실패", responseData.message);
        throw new Error(responseData.message);
    }

    return responseData;
};

export const postStatusChange = async (blogId: string, accessToken: string, postId: string, postStatus: "PUBLIC" | "PRIVATE") => {
    const updatePostStatus = async (token: string) => {
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/posts/${postId}/${postStatus}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    };

    let response = await updatePostStatus(accessToken);

    if (!response.ok) {
        if (response.status === 401) {
            try {
                const newAccessToken = await refreshToken(); // 액세스 토큰을 못받아오면 리프레시 토큰도 만료라서 재로그인 필요
                if (newAccessToken) {
                    response = await updatePostStatus(newAccessToken);
                }
            } catch (error) {
                if (error instanceof CustomHttpError) {
                    throw new CustomHttpError(error.status, "세션이 만료되었습니다.\n재로그인 해주세요.");
                }
            }
        } else {
            const errorData = await response.json();
            console.error("postStatusChange 함수 errorData >>> ", errorData); // 401 오류가 아닌 경우는 일단 로그만 남겨 놓기
        }
    }

    return response.json();
};
export const checkAvailabilityRequest = {
    blogId: async (value: string): Promise<{ status: number; isExist: boolean; message: string }> => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/check/blog-id/duplicate/${value}`,
            {
                method: "GET",
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
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/check/username/duplicate/${value}`,
            {
                method: "GET",
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

export const verifyEmailCode = async (blogId: string, code: string) => {
    const verify = {
        blogId,
        code,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/verify-code`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/auth/login`, {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/auth/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // 쿠키 삭제를 위해 사용
        });

        if (!response.ok && response.status === 401) {
            localStorage.removeItem("access_token"); // 변조된 토큰일때 로컬스토리지에서 액세스 토큰 제거

            const errorData = await response.json();
            throw new Error(errorData.message || "유효하지 않은 토큰입니다. 재 로그인 해주세요.");
        }
        if (!response.ok && !(response.status === 401)) {
            const errorData = await response.json();
            throw new Error(errorData.message || "로그아웃에 실패하였습니다. 잠시 후 다시 시도해 주세요.");
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

// FormData 사용시 Content-Type multipart/form-data 수동 설정 불필요
export const uploadFile = async (file: File, blogId: string, featured?: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    if (featured) {
        formData.append("featured", featured);
    }
    const upload = async (token: string | boolean) => {
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/${blogId}/temp/files/upload`, {
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
