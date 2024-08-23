"use client";

import React from 'react'
import ReactQueryProvider from "./ReactQueryProvider";

function ClientWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ReactQueryProvider>{children}</ReactQueryProvider>
    )
}

export default ClientWrapper
