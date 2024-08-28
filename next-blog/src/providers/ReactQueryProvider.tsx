
"use client";

import React from "react";

import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { queryClient } from "./ReactQueryPersistProvider";
import dynamic from "next/dynamic";

 

// dynamic을 사용하여 클라이언트 측에서만 컴포넌트를 로드
const ReactQueryPersistProvider = dynamic(
    () => import("./ReactQueryPersistProvider"),
    {
        ssr: false, // 서버 사이드 렌더링 비활성화
    }
);

export default function ReactQueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryPersistProvider>{children}</ReactQueryPersistProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}