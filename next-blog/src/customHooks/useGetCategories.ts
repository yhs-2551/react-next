import { useQuery, useQueryClient } from "react-query";
import { fetchCategories } from "@/services/api";
import { jwtDecode } from "jwt-decode";
import { useParams } from "next/navigation";

export const useGetAllCategories = () => {
    const queryClient = useQueryClient();

    const params = useParams();
    const userIdentifier = params.userIdentifier as string;

    const cachedCategories = localStorage.getItem("REACT_QUERY_OFFLINE_CACHE");

    console.log("캐시된 카테고리", cachedCategories);

    const shouldFetch = !cachedCategories;

    const query = useQuery(["categories", userIdentifier], () => fetchCategories(userIdentifier), {
        enabled: shouldFetch,
        staleTime: Infinity, // 데이터가 절대 stale하지 않음
        cacheTime: Infinity, // 캐시가 만료되지 않음
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
    });

    const refetchCategories = () => {
        queryClient.refetchQueries(["categories", userIdentifier], { exact: true });
    };

    return { ...query, refetchCategories };
};
