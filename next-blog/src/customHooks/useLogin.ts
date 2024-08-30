
import { useRouter } from "next/navigation";

import { useMutation } from "react-query";

interface LoginRequest {
    email: string;
    password: string;
}

const loginUser = async (loginData: LoginRequest) => {
    console.log("loginData >>> ", loginData);

    const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // 이 코드가 있어야 쿠키에 세션 ID값을 저장한다.
        body: JSON.stringify(loginData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
    }

    return response.json();
};

function useLogin() {
 

    return useMutation(loginUser, {
        onSuccess: (data) => {
            console.log("로그인 성공", data);
        },
        onError: (error) => {
            console.log("로그인 실패", error);
        },
    });
}

export default useLogin;
