import React, { Suspense } from "react";
import BlogList from "../components/BlogList";
import Pagination from "@/app/_components/pagination/Pagination";
import { notFound } from "next/navigation";
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
