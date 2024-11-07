"use client";

import React from "react";
import ReactQueryProvider from "./ReactQueryProvider";
import ReactQueryPersistProvider from "./ReactQueryPersistProvider";

function ClientWrapper({ children, usePersist = false }: { children: React.ReactNode; usePersist?: boolean }) {
    return usePersist ? <ReactQueryPersistProvider>{children}</ReactQueryPersistProvider> : <ReactQueryProvider>{children}</ReactQueryProvider>;
}

export default ClientWrapper;
