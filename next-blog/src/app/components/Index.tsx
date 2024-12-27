import React from "react";

import { PostResponse } from "@/types/PostTypes";
import PostsGrid from "./PostsGrid";
import ClientWrapper from "@/providers/ClientWrapper";

interface IndexProps {
    initialData: PostResponse[];
    totalElements: number;
}

export default function Index({ initialData, totalElements }: IndexProps) {
    return (
        <ClientWrapper>
            <PostsGrid initialData={initialData} totalElements={totalElements}/>
        </ClientWrapper>
    );
}
