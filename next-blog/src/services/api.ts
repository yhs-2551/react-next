import {
    QueryFunctionContext,
} from "react-query";

export const fetchPosts = async () => {
    const response = await fetch("http://localhost:8000/api/posts", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }

    const data = await response.json();
    return data;
};

export const fetchPost = async ({ queryKey }: QueryFunctionContext) => {
    const [, id] = queryKey;
    
    const response = await fetch(`http://localhost:8000/api/posts/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch post with id ${id}`);
    }

    const data = await response.json();
    return data;
};
export const fetchAccessToken = async () => {
    // 초기 로그인 시 브라우저 쿠키에 담긴 액세스 토큰을 서버에서 검증한 후, 다시 클라이언트측으로 응답 헤더를 통해 액세스 토큰 전송
    const response = await fetch(
        "http://localhost:8000/api/token/initial-token",
        {
            method: "GET",
            credentials: "include",
        }
    );

    // 액세스 토큰을 브라우저 (HTTP ONLY)쿠키에서 찾을 수 없을때 서버측에서 오류 발생
    if (!response.ok) {
        return false;
    }

    const responseAccessToken = response.headers
        .get("Authorization")
        ?.split(" ")[1];

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
        return false;
    }

    try {
        if (accessToken) {
            const response = await fetch(
                "http://localhost:8000/api/token/check-access-token",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            // 액세스 토큰이 유효하지 않을때 서버측 에러. 즉, isLoggedIn false
            if (!response.ok) {
                localStorage.removeItem("access_token");
                return false;
            }

            return true;
        }
    } catch (error) {
        console.log("토큰 유효성 검사 실패", error);
        return false;
    }
};

export const fetchIsAuthor = async (postId: string) => {
    console.log("fetchISAUTHOR 실행" + fetchIsAuthor);

    const accessToken = localStorage.getItem("access_token");

    const response = await fetch(
        `http://localhost:8000/api/token/${postId}/verify-author`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );

    const data = await response.json();
    return data.isAuthor; // 서버에서 isAuthor 값을 반환받아 true or false값을 반환
};

export const signupUser = async (newUser: {
    username: string;
    email: string;
    password: string;
}) => {
    try {
        const response = await fetch("http://localhost:8000/api/user/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "회원가입에 실패했습니다.");
        }

        return await response.json(); // 성공시 JSON 응답 반환
    } catch (error) {
        console.error("회원가입 실패:", error);
        throw error; // 상위 함수로 에러 전달
    }
};

export const loginUser = async (loginData: {
    email: string;
    password: string;
}) => {
    try {
        const response = await fetch("http://localhost:8000/api/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // 쿠키 저장을 위해 사용
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "로그인에 실패했습니다.");
        }

        return await response.json(); // 로그인 성공시 JSON 응답 반환
    } catch (error) {
        console.error("로그인 실패:", error);
        throw error; // 상위 함수로 에러 전달
    }
};

export const logoutUser = async () => {
    try {
        const accessToken = localStorage.getItem("access_token");

        const response = await fetch("http://localhost:8000/api/user/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include", // 쿠키 삭제를 위해 사용
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "로그아웃에 실패했습니다.");
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