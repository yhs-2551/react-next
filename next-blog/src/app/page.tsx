import React from "react";
import Index from "./components/Index";
import ClientWrapper from "@/providers/ClientWrapper";

function IndexPage() {
  return (
    <ClientWrapper>
      <Index />
    </ClientWrapper>
  );
}

export default IndexPage;
