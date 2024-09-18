import { useQuery } from "react-query";
import { fetchPost } from "@/services/api";
import type { Post } from "@/common/types/Post";

 
export const useGetPost = (id: string, initialData: Post) => {
    return useQuery(["post", id], fetchPost, {
        initialData,
        staleTime: 0,
        cacheTime: 600000, // 10분
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
    });
};
