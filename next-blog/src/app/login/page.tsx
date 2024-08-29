import React from "react";
import Login from "./components/Login";
import ClientWrapper from "@/providers/ClientWrapper";

function LoginPage() {
  return (
    <ClientWrapper>
      <Login />
    </ClientWrapper>
  );
}

export default LoginPage;
