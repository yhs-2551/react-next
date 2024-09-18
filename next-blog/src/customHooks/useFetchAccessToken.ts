// // 로그인 안된 사용자 확인 또는 로그인 후 리다이렉트 시 초기에 쿠키에 있는 액세스 토큰을 서버로 요청 해 다시 응답 헤더로 받아와 로컬 스토리지에 저장하는 커스텀 훅

// import { fetchAccessToken } from "@/services/api";
// import { QueryClient, useQuery, useQueryClient } from "react-query";

// const useFetchAccessToken = (isLoggedIn: boolean) => {
//     console.log("useFetchAccessToken 안 isLoggedIn" + isLoggedIn);

//     const queryClient = useQueryClient();

//     return useQuery(
//         ["fetchAccessToken"], // Query key
//         () => fetchAccessToken(queryClient), // Query function (queryFn)
//         {
//             enabled: !isLoggedIn,
//             refetchOnWindowFocus: false,
//             refetchOnReconnect: true,
//             refetchOnMount: true,
//         }
//     );
// };

// export default useFetchAccessToken;
