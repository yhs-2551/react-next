import axios from "axios";

export const fetchPosts = async () => {
    const { data } = await axios.get('http://localhost:8000/api/posts');

    console.log("data >>>. ", data);
    return data;
};  