import React from "react";
import SignUp from "./components/SignUp";
import ClientWrapper from "@/providers/ClientWrapper";

function SignUpPage() {
  return (
    <ClientWrapper>
      <SignUp />
    </ClientWrapper>
  );
}

export default SignUpPage;
