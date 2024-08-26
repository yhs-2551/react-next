import axios from "axios";
import { QueryFunctionContext } from "react-query";

export const fetchPosts = async () => {
    const { data } = await axios.get('http://localhost:8000/api/posts');
    return data;
};  

export const fetchPost = async ({ queryKey }: QueryFunctionContext) => {
    const [, id] = queryKey;
    const { data } = await axios.get(`http://localhost:8000/api/posts/${id}`);
    return data;
};  

 