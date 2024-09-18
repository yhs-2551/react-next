import { useQuery } from "react-query";
import { fetchPosts } from "@/services/api";
import type { Post } from "@/common/types/Post";

export const useGetPosts = (initialData: Post[]) => {
    return useQuery(["posts"], fetchPosts, {
        //서버에서 가져온 데이터를 바로 캐시에 저장. initialData는 쿼리가 실행되기 전에 useQuery에서 기본값으로 사용할 데이터를 의미
        initialData,
        //만약 10000이면 10초 즉, 10초까지 신선한 데이터라고 판단 즉, 10초 뒤에 오래된 데이터라고 간주, INFINITY는 항상 신선한 데이터라고 판단.
        // 0초는 0초까지 신선한 데이터라고 판단, 즉 바로 오래된 데이터라 판단하여 항상 새로운 데이터를 가져 온다.
        staleTime: 0, // INFINITY 항상 신선한 상태라고 판단, 0 오래된 데이터라고 판단. 삭제시에 바로 적용하기 위해 0초로 설정해야함.
        cacheTime: 600000, //  cacheTime의 기본값은 5분. 브라우저 메모리 캐시에 10분동안 저장, 새로 고침하면 없어지지만 localstorage에 있는 데이터를 다시 캐시
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
    });
};
