// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { fetchCategories } from "@/services/api";
// import { jwtDecode } from "jwt-decode";
// import { useParams } from "next/navigation";

// export const useGetAllCategories = () => {
//     const queryClient = useQueryClient();

//     const params = useParams();
//     const blogId = params.blogId as string;

//     const cachedCategories = localStorage.getItem("REACT_QUERY_OFFLINE_CACHE");

//     const shouldFetch = !cachedCategories;

//     console.log("shouldFetch", shouldFetch);

//     const query = useQuery(["categories", blogId], () => fetchCategories(blogId), {
//         enabled: shouldFetch,
//         staleTime: Infinity, // 데이터가 절대 stale하지 않음
//         cacheTime: Infinity, // 캐시가 만료되지 않음
//         refetchOnWindowFocus: false,
//         refetchOnMount: false,
//         refetchOnReconnect: true,
//     });

//     const refetchCategories = () => {
//         queryClient.refetchQueries(["categories", blogId], { exact: true });
//     };

//     return { ...query, refetchCategories };
// };
