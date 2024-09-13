import { checkAccessToken } from "@/services/api";
import { QueryClient, useQuery, useQueryClient } from "react-query";


function useCheckAccessToken(isLoggedIn: boolean) {
    const queryClient = useQueryClient();

    return useQuery(
        ["isLoggedIn"],
        () => checkAccessToken(queryClient), // queryFn으로 checkAccessTokenFn 사용
        {
            enabled: isLoggedIn, // isLoggedIn이 True일때만 실행
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
        }
    );

    
}

export default useCheckAccessToken;
