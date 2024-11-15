import React from "react";

import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

// import { queryClient } from "./ReactQueryPersistProvider";

export default function ReactQueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
}
