// import { useRouter } from "next/navigation";

// import { useMutation } from "react-query";

// interface LoginRequest {
//     email: string;
//     password: string;
// }

// const loginUser = async (loginData: LoginRequest) => {
//     console.log("loginData >>> ", loginData);

//     const response = await fetch("http://localhost:8000/api/user/login", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         credentials: "include", // 이 코드가 있어야 쿠키에 세션 ID값, access token, refresh token 등을 저장한다. 또한 요청을 보낼때 쿠키에 담긴 요청도 같이 보낼 수 있다
//         body: JSON.stringify(loginData),
//     });

//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message);
//     }

//     return response.json();
// };

// function useLogin() {
//     return useMutation(loginUser, {});
// }

// export default useLogin;
