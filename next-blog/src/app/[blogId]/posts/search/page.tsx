import React, { Suspense } from "react"; 
import UserPageSearchWrapper from "./components/UserPageSearchWrapper";
// import { CacheTimes } from "@/constants/cache-constants";

export default async function PostSearchResultsPage({
    params,
    searchParams,
}: {
    params: Promise<{ blogId: string; categoryName: string }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const { blogId } = await params;

    return <UserPageSearchWrapper blogId={blogId} searchParams={await searchParams} />;
}
