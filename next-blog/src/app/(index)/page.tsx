"use client"

import React from 'react'
import BlogList from "./components/BlogList"
import ClientWrapper from "@/providers/ClientWrapper"

function HomePage() {
    return (
        <ClientWrapper>
            <BlogList />
        </ClientWrapper>
    )
}

export default HomePage
