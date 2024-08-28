import ClientWrapper from "@/providers/ClientWrapper"
import React from 'react'
import Login from "./components/Login"

function LoginPage() {
  return (
    <ClientWrapper>
        <Login />
    </ClientWrapper>
  )
}

export default LoginPage
