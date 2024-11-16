import React from "react";
import ClientWrapper from "@/providers/ClientWrapper";
import Index from "./(main)/components/Index";

function IndexPage() {
    return (
        <ClientWrapper>
            <Index />
        </ClientWrapper>
    );
}

export default IndexPage;
