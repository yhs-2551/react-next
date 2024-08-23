import { useQuery } from "react-query";
import { fetchPosts } from "@/services/api";

export const usePosts = () => {
    return useQuery("posts", fetchPosts);
};  