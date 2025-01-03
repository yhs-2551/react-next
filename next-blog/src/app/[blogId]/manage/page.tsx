import React from "react";
import UserManage from "./components/UserManage";
import AuthCheck from "../components/AuthCheck";

export default function UserManagePage() {
    return (
        <AuthCheck>
            <UserManage />
        </AuthCheck>
    );
}
