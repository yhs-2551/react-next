import React from "react";
import UserManage from "./components/UserManage";
import AuthCheck from "../components/AuthCheck";
import ClientWrapper from "@/providers/ClientWrapper";

export default function UserManagePage() {
    return (
        <ClientWrapper>
            <AuthCheck>
                <UserManage />
            </AuthCheck>
        </ClientWrapper>
    );
}
