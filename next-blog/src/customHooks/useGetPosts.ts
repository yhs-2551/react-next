import { useQuery } from "react-query";
import { fetchPosts } from "@/services/api";


interface Post {
    title: string;
    postStatus: "PUBLIC" | "PRIVATE";
    categoryName: string | null;
    createdAt: string;
    content: string;
    // commentCount: number;
    // id: number;
    // replyCount: number;
    // updatedAt: string; 이것도 admin 페이지에서 관리할지 고민
    // userId: number | null;
    // userName: string | null; 사용자명은 상세페이지에서 보여줄 지 고미
    // views: number; // 조회수는 따로 admin에서 관리할지, 다른 사용자가 조회했을때 바로 메인 페이지에서 조회수를 보여줄지 고민. 전자가 좋아보임
}


export const useGetPosts = (initialData: Post[]) => {
    return useQuery(["posts"], fetchPosts, {
        initialData,
        //만약 10000이면 10초 즉, 10초까지 신선한 데이터라고 판단 즉, 10초 뒤에 오래된 데이터라고 간주, INFINITY는 항상 신선한 데이터라고 판단.
        // 0초는 0초까지 신선한 데이터라고 판단, 즉 바로 오래된 데이터라 판단하여 항상 새로운 데이터를 가져 온다.
        staleTime: Infinity, // 항상 신선한 상태라고 판단
        cacheTime: 600000, //  cacheTime의 기본값은 5분. 브라우저 메모리 캐시에 10분동안 저장, 새로 고침하면 없어지지만 localstorage에 있는 데이터를 다시 캐시
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
    });
};
