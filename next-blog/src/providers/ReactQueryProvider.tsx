
import React from "react";

import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

// import { queryClient } from "./ReactQueryPersistProvider";

export default function ReactQueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    console.log("얘 실행은 안댐");

    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
}
