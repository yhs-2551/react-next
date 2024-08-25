import axios from "axios";

import { useMutation, useQueryClient } from "react-query";

function useDeletePost() {
    const queryClient = useQueryClient();
    return useMutation(
        (postId: string) =>
            axios.delete("http://localhost:8000/api/posts/" + postId),
        {
            onError: (error) => {
                console.error("Error deleting post:", error);
            },
            onSuccess: () => {
                queryClient.invalidateQueries("posts");
                console.log("Post deleted successfully");
            },
        }
    );
}

export default useDeletePost;
