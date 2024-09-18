// import { checkAccessToken } from "@/services/api";
// import { useRouter } from "next/navigation";
// import { QueryClient, useQuery, useQueryClient } from "react-query";

// function useCheckAccessToken(accessToken: boolean | string) {

//     console.log("accessToken 값 >>" + accessToken);

//     const isAccessToken = !!accessToken;

//     console.log("checkAccessToken 실행");

//     console.log("isAccessToken >>>>" + isAccessToken);
    
//     const queryClient = useQueryClient();

//     return useQuery(
//         ["checkAccessToken"],
//         () => checkAccessToken(queryClient), // queryFn으로 checkAccessTokenFn 사용
//         {
//             enabled: isAccessToken, // isLoggedIn이 True일때만 실행
//             refetchOnWindowFocus: false,
//             refetchOnReconnect: true,
//             refetchOnMount: true,
//         }
//     );
// }

// export default useCheckAccessToken;
