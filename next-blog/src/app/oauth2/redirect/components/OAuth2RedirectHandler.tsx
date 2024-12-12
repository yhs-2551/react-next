"use client";

import { useAuthStore } from "@/store/appStore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

export default function OAuth2RedirectHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const { setShowOAuth2NewUserModal, setTempOAuth2UserUniqueId } = useAuthStore();

    useEffect(() => {
        const lastVisitedPath = localStorage.getItem("lastVisitedPath") ?? "/";
        const showNewUserModal = searchParams.get("showNewUserModal");
        const tempOAuth2UserUniqueId = searchParams.get("tempOAuth2UserUniqueId");

        console.log("tempOAuth2UserUniqueId >>>", tempOAuth2UserUniqueId);

        const isDirect = searchParams.get("direct");

        if (showNewUserModal === "true") {
            router.replace(lastVisitedPath);
            setShowOAuth2NewUserModal(true);
            localStorage.removeItem("lastVisitedPath");
            
            setTempOAuth2UserUniqueId(tempOAuth2UserUniqueId!);
        }

        if (isDirect === "true") {
            router.replace(lastVisitedPath);
            localStorage.removeItem("lastVisitedPath");
        }
    }, []);

    return null;
} 