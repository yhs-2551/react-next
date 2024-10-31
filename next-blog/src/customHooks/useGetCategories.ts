import { useQuery } from "react-query";
import { fetchCategories } from "@/services/api";
 
export const useGetAllCategories = () => {
    return useQuery(["categories"], fetchCategories, {
        staleTime: Infinity,
        cacheTime: Infinity, // 10분
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
};
