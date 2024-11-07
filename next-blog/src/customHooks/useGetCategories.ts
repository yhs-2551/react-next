import { useQuery, useQueryClient } from "react-query";
import { fetchCategories } from "@/services/api";

export const useGetAllCategories = () => {

    const queryClient = useQueryClient();
    const query = useQuery(["categories"], fetchCategories, {
        enabled: false,
        staleTime: Infinity, // 데이터가 절대 stale하지 않음
        cacheTime: Infinity,  // 캐시가 만료되지 않음
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
    });

    const refetchCategories = () => {
        queryClient.refetchQueries(["categories"], { exact: true });
    };

    return { ...query, refetchCategories };


};
