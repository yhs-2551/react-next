import React from "react";

import { PostResponse } from "@/types/PostTypes";
import PostsGrid from "./PostsGrid"; 

interface IndexProps {
    initialData: PostResponse[];
    totalElements: number;
}

export default function Index({ initialData, totalElements }: IndexProps) {
    return <PostsGrid initialData={initialData} totalElements={totalElements} />;
}
