"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SearchInput from "./SearchInput";
import ClientWrapper from "@/providers/ClientWrapper";

type SearchType = "TITLE" | "CONTENT" | "ALL";

export default function Search() {
    return (
        <ClientWrapper>
            <SearchComponent />
        </ClientWrapper>
    );
}
function SearchComponent() {
    const params = useParams();
    const blogId = params.blogId as string;
    const router = useRouter();
    const [searchType, setSearchType] = useState<SearchType>("TITLE");

    const handleSearch = (keyword: string) => {
        const params = new URLSearchParams();
        params.set("page", "1");

        if (!keyword.trim()) {
            router.push(`/${blogId}/posts?${params.toString()}`);
            return;
        }
        router.push(`/${blogId}/posts?searchType=${searchType}&keyword=${encodeURIComponent(keyword)}`);
    };

    return (
        <div className='mb-6 px-4'>
            <div className='flex gap-2'>
                <select value={searchType} onChange={(e) => setSearchType(e.target.value as SearchType)} className='border rounded px-3 py-2'>
                    <option value='TITLE'>제목</option>
                    <option value='CONTENT'>내용</option>
                    <option value='ALL'>제목+내용</option>
                </select>
                <SearchInput blogId={blogId} searchType={searchType} onSearch={handleSearch} />
            </div>
        </div>
    );
}
